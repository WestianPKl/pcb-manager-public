import { FastifyInstance } from 'fastify'
import crypto from 'crypto'
import { authService } from './auth.service.js'
import { registerSchema, loginSchema } from './auth.schema.js'
import { env } from '../../config/env.js'
import { users } from '../../db/schema/users.js'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index'
import sharp from 'sharp'
import { z } from 'zod'

const updateProfileSchema = z.object({
	username: z.string().min(3).max(255).optional(),
	name: z.string().min(1).max(255).optional(),
	surname: z.string().min(1).max(255).optional(),
	email: z.string().email().optional(),
})

export default async function authRoutes(app: FastifyInstance) {
	const auth = { onRequest: [app.authenticate] }

	app.post(
		'/register',
		{
			schema: {
				tags: ['Auth'],
				summary: 'Register new user',
				body: {
					type: 'object',
					required: ['username', 'name', 'surname', 'email', 'password'],
					properties: {
						username: { type: 'string', minLength: 3 },
						name: { type: 'string' },
						surname: { type: 'string' },
						email: { type: 'string', format: 'email' },
						password: { type: 'string', minLength: 8 },
					},
				},
				response: {
					201: {
						type: 'object',
						properties: {
							user: {
								type: 'object',
								properties: {
									id: { type: 'string' },
									username: { type: 'string' },
									email: { type: 'string' },
								},
							},
						},
					},
					409: {
						type: 'object',
						properties: {
							error: { type: 'string' },
						},
					},
				},
			},
		},
		async (request, reply) => {
			const input = registerSchema.parse(request.body)

			try {
				const user = await authService.register(input)
				return reply.status(201).send({ user })
			} catch (err: any) {
				if (err.message === 'EMAIL_TAKEN') {
					return reply.status(409).send({ error: 'Email already taken' })
				}
				throw err
			}
		},
	)

	app.post('/login', async (request, reply) => {
		const input = loginSchema.parse(request.body)

		try {
			const user = await authService.login(input)

			const accessToken = app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: env.JWT_ACCESS_EXPIRES })

			const refreshToken = crypto.randomBytes(64).toString('hex')
			const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

			const expiresAt = new Date()
			expiresAt.setDate(expiresAt.getDate() + 30)
			await authService.saveRefreshToken(user.id, refreshTokenHash, expiresAt)

			reply.setCookie('refresh_token', refreshToken, {
				httpOnly: true,
				secure: env.NODE_ENV === 'production',
				sameSite: 'strict',
				path: '/api/v1/auth/refresh',
				maxAge: 60 * 60 * 24 * 30,
			})

			return reply.send({ accessToken, user })
		} catch (err: any) {
			if (err.message === 'INVALID_CREDENTIALS') {
				return reply.status(401).send({ error: 'Invalid email or password' })
			}
			throw err
		}
	})

	app.post(
		'/logout',
		{
			onRequest: [app.authenticate],
		},
		async (request, reply) => {
			const refreshToken = request.cookies?.refresh_token
			if (refreshToken) {
				const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
				await authService.revokeRefreshToken(tokenHash)
			}
			reply.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' })
			return reply.send({ message: 'Logged out' })
		},
	)

	app.post('/refresh', async (request, reply) => {
		const refreshToken = request.cookies?.refresh_token

		if (!refreshToken) {
			return reply.status(401).send({ error: 'No refresh token provided' })
		}

		const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

		const session = await authService.findValidSession(tokenHash)

		if (!session) {
			return reply.status(401).send({ error: 'Session invalid or expired' })
		}

		const user = await authService.findUserById(session.userId)

		if (!user) {
			return reply.status(401).send({ error: 'User does not exist' })
		}

		await authService.revokeRefreshToken(tokenHash)

		const accessToken = app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: env.JWT_ACCESS_EXPIRES })

		const newRefreshToken = crypto.randomBytes(64).toString('hex')
		const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex')

		const expiresAt = new Date()
		expiresAt.setDate(expiresAt.getDate() + 30)
		await authService.saveRefreshToken(session.userId, newRefreshTokenHash, expiresAt)

		reply.setCookie('refresh_token', newRefreshToken, {
			httpOnly: true,
			secure: env.NODE_ENV === 'production',
			sameSite: 'strict',
			path: '/api/v1/auth/refresh',
			maxAge: 60 * 60 * 24 * 30,
		})

		return reply.send({ accessToken, user })
	})

	app.get('/me', auth, async (request, reply) => {
		const user = request.user as { id: string }
		const profile = await authService.findUserById(user.id)
		if (!profile) return reply.status(404).send({ error: 'User not found' })
		return reply.send({ user: profile })
	})

	app.put(
		'/profile',
		{
			onRequest: [app.authenticate],
			schema: {
				tags: ['Auth'],
				summary: 'Update user profile',
				body: {
					type: 'object',
					required: [],
					properties: {
						username: { type: 'string', minLength: 3 },
						name: { type: 'string' },
						surname: { type: 'string' },
						email: { type: 'string', format: 'email' },
					},
				},
				response: {
					200: {
						type: 'object',
						properties: {
							user: {
								type: 'object',
								properties: {
									id: { type: 'string' },
									username: { type: 'string' },
									email: { type: 'string' },
									name: { type: 'string' },
									surname: { type: 'string' },
								},
							},
						},
					},
					400: {
						type: 'object',
						properties: {
							error: { type: 'string' },
						},
					},
					409: {
						type: 'object',
						properties: {
							error: { type: 'string' },
						},
						description: 'Conflict - email or username already taken',
						example: {
							error: 'Email already taken',
						},
						409: {
							type: 'object',
							properties: {
								error: { type: 'string' },
							},
							description: 'Conflict - email or username already taken',
							example: {
								error: 'Username already taken',
							},
						},
					},
				},
			},
		},
		async (request, reply) => {
			const user = request.user as { id: string }
			const input = updateProfileSchema.parse(request.body)
			const updated = await authService.updateProfile(user.id, input)
			return reply.send({ user: updated })
		},
	)

	app.post('/avatar', auth, async (request, reply) => {
		const data = await request.file()
		if (!data) return reply.status(400).send({ error: 'Brak pliku' })

		const allowed = ['image/jpeg', 'image/png', 'image/webp']
		if (!allowed.includes(data.mimetype)) {
			return reply.status(400).send({ error: 'Dozwolone tylko JPG, PNG, WebP' })
		}

		const user = request.user as { id: string }

		const [currentUser] = await db
			.select({ avatar: users.avatar, avatarBig: users.avatarBig })
			.from(users)
			.where(eq(users.id, user.id))
			.limit(1)

		const buffer = await data.toBuffer()

		const original = await sharp(buffer)
			.resize(500, 500, { fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 85 })
			.toBuffer()

		const thumbnail = await sharp(buffer).resize(100, 100, { fit: 'cover' }).webp({ quality: 80 }).toBuffer()

		const [avatarUrl, avatarBigUrl] = await Promise.all([
			app.storage.upload('avatars', thumbnail, `thumb_${user.id}.webp`, 'image/webp'),
			app.storage.upload('avatars', original, `orig_${user.id}.webp`, 'image/webp'),
		])

		if (currentUser?.avatar || currentUser?.avatarBig) {
			await Promise.allSettled([
				currentUser.avatar && app.storage.deleteByUrl('avatars', currentUser.avatar),
				currentUser.avatarBig && app.storage.deleteByUrl('avatars', currentUser.avatarBig),
			])
		}

		await db
			.update(users)
			.set({ avatar: avatarUrl, avatarBig: avatarBigUrl, updatedAt: new Date() })
			.where(eq(users.id, user.id))

		return reply.send({ avatar: avatarUrl, avatarBig: avatarBigUrl })
	})

	app.put('/password', auth, async (request, reply) => {
		const user = request.user as { id: string }
		const { currentPassword, newPassword } = request.body as {
			currentPassword: string
			newPassword: string
		}

		try {
			await authService.changePassword(user.id, currentPassword, newPassword)
			return reply.send({ message: 'Password changed successfully' })
		} catch (err: any) {
			if (err.message === 'INVALID_PASSWORD') {
				return reply.status(400).send({ error: 'Current password is incorrect' })
			}
			throw err
		}
	})

	app.post('/forgot-password', async (request, reply) => {
		const { email } = request.body as { email: string }
		if (!email) return reply.status(400).send({ error: 'Email is required' })

		await authService.requestPasswordReset(email).catch(() => {})
		return reply.send({ message: 'If this email exists, a reset link has been sent' })
	})

	app.post('/reset-password', async (request, reply) => {
		const { token, password } = request.body as { token: string; password: string }
		if (!token || !password) return reply.status(400).send({ error: 'Token and password are required' })

		try {
			await authService.resetPassword(token, password)
			return reply.send({ message: 'Password updated successfully' })
		} catch (err: any) {
			if (err.message === 'INVALID_TOKEN' || err.message === 'TOKEN_EXPIRED') {
				return reply.status(400).send({ error: 'Invalid or expired reset link' })
			}
			throw err
		}
	})
}
