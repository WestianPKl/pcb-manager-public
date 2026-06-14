import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index'
import { users, sessions } from '../../db/schema/index'
import type { RegisterInput, LoginInput } from './auth.schema.js'
import crypto from 'crypto'
import { env } from '../../config/env.js'
import { sendPasswordResetEmail } from '../../utils/mailer.js'

export const authService = {
	async getAllUsers() {
		const usersList = await db.query.users.findMany({
			columns: {
				id: true,
			},
		})
		return usersList
	},

	async register(input: RegisterInput) {
		const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1)

		if (existing.length > 0) {
			throw new Error('EMAIL_TAKEN')
		}

		const passwordHash = await bcrypt.hash(input.password, 12)

		const [user] = await db
			.insert(users)
			.values({
				username: input.username,
				name: input.name,
				surname: input.surname,
				email: input.email,
				password: passwordHash,
			})
			.returning({
				id: users.id,
				username: users.username,
				email: users.email,
			})

		return user
	},

	async login(input: LoginInput) {
		const user = await db.query.users.findFirst({
			where: eq(users.email, input.email),
			columns: {
				id: true,
				username: true,
				email: true,
				name: true,
				surname: true,
				avatar: true,
				avatarBig: true,
				password: true,
			},
			with: {
				permissions: {
					columns: {
						userId: false,
						permissionId: false,
					},
					with: {
						permission: {
							columns: {
								id: true,
								name: true,
								functionalityId: false,
								accessLevelId: false,
								createdById: false,
								updatedById: false,
								createdAt: false,
								updatedAt: false,
							},
							with: {
								functionality: {
									columns: {
										id: true,
										name: true,
									},
								},
								accessLevel: {
									columns: {
										accessLevel: true,
										name: true,
									},
								},
							},
						},
					},
				},
			},
		})

		if (!user) {
			throw new Error('INVALID_CREDENTIALS')
		}

		const valid = await bcrypt.compare(input.password, user.password)
		if (!valid) {
			throw new Error('INVALID_CREDENTIALS')
		}

		return {
			id: user.id,
			username: user.username,
			email: user.email,
			name: user.name,
			surname: user.surname,
			avatar: user.avatar,
			avatarBig: user.avatarBig,
			permissions: user.permissions.map(up => ({
				id: up.permission.id,
				name: up.permission.name,
				functionalityId: up.permission.functionality.id,
				functionality: up.permission.functionality.name,
				accessLevelId: up.permission.accessLevel.accessLevel,
				accessLevel: up.permission.accessLevel.name,
			})),
		}
	},

	async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
		await db.insert(sessions).values({
			userId,
			tokenHash,
			expiresAt,
		})
	},

	async revokeRefreshToken(tokenHash: string) {
		await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.tokenHash, tokenHash))
	},

	async findValidSession(tokenHash: string) {
		const [session] = await db.select().from(sessions).where(eq(sessions.tokenHash, tokenHash)).limit(1)

		if (!session) return null
		if (session.revokedAt) return null
		if (session.expiresAt < new Date()) return null

		return session
	},

	async findUserById(id: string) {
		const user = await db.query.users.findFirst({
			where: eq(users.id, id),
			columns: {
				id: true,
				username: true,
				email: true,
				name: true,
				surname: true,
				avatar: true,
				avatarBig: true,
			},
			with: {
				permissions: {
					columns: {
						userId: false,
						permissionId: false,
					},
					with: {
						permission: {
							columns: {
								id: true,
								name: true,
								functionalityId: false,
								accessLevelId: false,
								createdById: false,
								updatedById: false,
								createdAt: false,
								updatedAt: false,
							},
							with: {
								functionality: {
									columns: {
										id: true,
										name: true,
									},
								},
								accessLevel: {
									columns: {
										accessLevel: true,
										name: true,
									},
								},
							},
						},
					},
				},
			},
		})

		if (!user) return null

		const data = {
			id: user.id,
			username: user.username,
			email: user.email,
			name: user.name,
			surname: user.surname,
			avatar: user.avatar,
			avatarBig: user.avatarBig,
			permissions: user.permissions.map(up => ({
				id: up.permission.id,
				name: up.permission.name,
				functionalityId: up.permission.functionality.id,
				functionality: up.permission.functionality.name,
				accessLevelId: up.permission.accessLevel.accessLevel,
				accessLevel: up.permission.accessLevel.name,
			})),
		}

		return data ?? null
	},

	async updateProfile(
		userId: string,
		data: Partial<{
			username: string
			name: string
			surname: string
			email: string
		}>,
	) {
		const [updatedUser] = await db
			.update(users)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(users.id, userId))
			.returning({
				id: users.id,
				username: users.username,
				email: users.email,
				name: users.name,
				surname: users.surname,
				avatar: users.avatar,
				avatarBig: users.avatarBig,
			})

		return updatedUser
	},

	async changePassword(userId: string, currentPassword: string, newPassword: string) {
		const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

		if (!user) throw new Error('USER_NOT_FOUND')

		const valid = await bcrypt.compare(currentPassword, user.password)
		if (!valid) throw new Error('INVALID_PASSWORD')

		const hash = await bcrypt.hash(newPassword, 12)

		await db.update(users).set({ password: hash, updatedAt: new Date() }).where(eq(users.id, userId))
	},

	async requestPasswordReset(email: string) {
		const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

		if (!user) return

		const token = crypto.randomBytes(32).toString('hex')
		const expires = new Date(Date.now() + 3600 * 1000)

		await db
			.update(users)
			.set({
				resetPasswordToken: token,
				resetPasswordExpires: expires,
				updatedAt: new Date(),
			})
			.where(eq(users.id, user.id))

		const resetLink = `${env.FRONTEND_URL}/reset-password/${token}`
		await sendPasswordResetEmail(user.email, resetLink)
	},

	async resetPassword(token: string, newPassword: string) {
		const [user] = await db.select().from(users).where(eq(users.resetPasswordToken, token)).limit(1)

		if (!user) throw new Error('INVALID_TOKEN')
		if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
			throw new Error('TOKEN_EXPIRED')
		}

		const hash = await bcrypt.hash(newPassword, 12)

		await db
			.update(users)
			.set({
				password: hash,
				resetPasswordToken: null,
				resetPasswordExpires: null,
				updatedAt: new Date(),
			})
			.where(eq(users.id, user.id))
	},
}
