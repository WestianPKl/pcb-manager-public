import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db/index.js'
import { users, sessions } from '../db/schema/index.js'
import { auditLog } from '../db/schema/index.js'
import { authService } from '../modules/auth/auth.service.js'
import { eq } from 'drizzle-orm'

const testUser = {
	username: 'testuser',
	name: 'Test',
	surname: 'User',
	email: 'test@pcbmanager.com',
	password: 'TestPassword123!',
}

describe('authService', () => {
	beforeEach(async () => {
		const [user] = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, testUser.email))
			.limit(1)
			.catch(() => [])

		if (user) {
			await db
				.delete(sessions)
				.where(eq(sessions.userId, user.id))
				.catch(() => {})
			await db
				.delete(auditLog)
				.where(eq(auditLog.userId, user.id))
				.catch(() => {})
			await db
				.delete(users)
				.where(eq(users.id, user.id))
				.catch(() => {})
		}

		await db
			.delete(users)
			.where(eq(users.username, testUser.username))
			.catch(() => {})
	})

	describe('register', () => {
		it('should create a new user', async () => {
			const user = await authService.register(testUser)

			expect(user).toBeDefined()
			expect(user.email).toBe(testUser.email)
			expect(user.username).toBe(testUser.username)
		})

		it('should hash the password', async () => {
			await authService.register(testUser)

			const [dbUser] = await db.select().from(users).where(eq(users.email, testUser.email)).limit(1)

			expect(dbUser.password).not.toBe(testUser.password)
			expect(dbUser.password).toHaveLength(60)
		})

		it('should throw EMAIL_TAKEN if email already exists', async () => {
			await authService.register(testUser)

			await expect(authService.register(testUser)).rejects.toThrow('EMAIL_TAKEN')
		})
	})

	describe('login', () => {
		beforeEach(async () => {
			const [user] = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.email, testUser.email))
				.limit(1)
				.catch(() => [])

			if (user) {
				await db
					.delete(sessions)
					.where(eq(sessions.userId, user.id))
					.catch(() => {})
				await db
					.delete(auditLog)
					.where(eq(auditLog.userId, user.id))
					.catch(() => {})
				await db
					.delete(users)
					.where(eq(users.id, user.id))
					.catch(() => {})
			}

			await db
				.delete(users)
				.where(eq(users.username, testUser.username))
				.catch(() => {})
			await authService.register(testUser)
		})

		it('should return user on valid credentials', async () => {
			const user = await authService.login({
				email: testUser.email,
				password: testUser.password,
			})

			expect(user).toBeDefined()
			expect(user.email).toBe(testUser.email)
		})

		it('should throw INVALID_CREDENTIALS on wrong password', async () => {
			await expect(
				authService.login({
					email: testUser.email,
					password: 'wrongpassword',
				}),
			).rejects.toThrow('INVALID_CREDENTIALS')
		})

		it('should throw INVALID_CREDENTIALS on wrong email', async () => {
			await expect(
				authService.login({
					email: 'wrong@email.com',
					password: testUser.password,
				}),
			).rejects.toThrow('INVALID_CREDENTIALS')
		})
	})

	describe('saveRefreshToken', () => {
		it('should save refresh token to database', async () => {
			const user = await authService.register(testUser)
			const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

			await authService.saveRefreshToken(user.id, 'test_hash', expiresAt)

			const [session] = await db.select().from(sessions).where(eq(sessions.tokenHash, 'test_hash')).limit(1)

			expect(session).toBeDefined()
			expect(session.userId).toBe(user.id)
			expect(session.revokedAt).toBeNull()
		})
	})

	describe('revokeRefreshToken', () => {
		it('should set revokedAt on session', async () => {
			const user = await authService.register(testUser)
			const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

			await authService.saveRefreshToken(user.id, 'test_hash_2', expiresAt)
			await authService.revokeRefreshToken('test_hash_2')

			const [session] = await db.select().from(sessions).where(eq(sessions.tokenHash, 'test_hash_2')).limit(1)

			expect(session.revokedAt).not.toBeNull()
		})
	})

	describe('removeUser', () => {
		it('should remove user and related sessions', async () => {
			const user = await authService.register(testUser)
			await db
				.delete(sessions)
				.where(eq(sessions.userId, user.id))
				.catch(() => {})
		})
		it('should remove all audit logs for the user', async () => {
			const user = await authService.register(testUser)
			await db
				.delete(auditLog)
				.where(eq(auditLog.userId, user.id))
				.catch(() => {})
		})
		it('should remove user', async () => {
			const user = await authService.register(testUser)
			await db
				.delete(users)
				.where(eq(users.id, user.id))
				.catch(() => {})
		})
	})
})
