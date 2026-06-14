import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '../db/index.js'
import {
	auditLog,
	permissionAccessLevel,
	permissionFunctionality,
	permissions,
	userPermissions,
	sessions,
	users,
} from '../db/schema/index.js'
import { adminService } from '../modules/admin/admin.service.js'
import { authService } from '../modules/auth/auth.service.js'
import { eq, like } from 'drizzle-orm'

const TEST_ACCESS_LEVEL = 98
const TEST_ACCESS_LEVEL_DELETE = 97

let testUserId: string
let secondUserId: string
let testFunctionalityId: string
let testPermissionId: string

async function cleanupAdminData() {
	await db
		.delete(userPermissions)
		.where(eq(userPermissions.userId, secondUserId ?? ''))
		.catch(() => {})
	await db
		.delete(permissions)
		.where(eq(permissions.accessLevelId, TEST_ACCESS_LEVEL))
		.catch(() => {})
	await db
		.delete(permissions)
		.where(eq(permissions.accessLevelId, TEST_ACCESS_LEVEL_DELETE))
		.catch(() => {})
	await db
		.delete(permissionFunctionality)
		.where(like(permissionFunctionality.name, 'Test Functionality%'))
		.catch(() => {})
	await db
		.delete(permissionAccessLevel)
		.where(eq(permissionAccessLevel.accessLevel, TEST_ACCESS_LEVEL))
		.catch(() => {})
	await db
		.delete(permissionAccessLevel)
		.where(eq(permissionAccessLevel.accessLevel, TEST_ACCESS_LEVEL_DELETE))
		.catch(() => {})
}

describe('adminService', () => {
	beforeAll(async () => {
		await cleanupAdminData()

		const user = await authService.register({
			username: `admintest_${Date.now()}`,
			name: 'Admin',
			surname: 'Test',
			email: `admintest_${Date.now()}@pcbmanager.com`,
			password: 'TestPassword123!',
		})
		testUserId = user.id

		const user2 = await authService.register({
			username: `admintest2_${Date.now()}`,
			name: 'Admin2',
			surname: 'Test2',
			email: `admintest2_${Date.now()}@pcbmanager.com`,
			password: 'TestPassword123!',
		})
		secondUserId = user2.id
	})

	afterAll(async () => {
		await cleanupAdminData()
		await db
			.delete(sessions)
			.where(eq(sessions.userId, testUserId))
			.catch(() => {})
		await db
			.delete(sessions)
			.where(eq(sessions.userId, secondUserId))
			.catch(() => {})
		await db
			.delete(auditLog)
			.where(eq(auditLog.userId, testUserId))
			.catch(() => {})
		await db
			.delete(auditLog)
			.where(eq(auditLog.userId, secondUserId))
			.catch(() => {})
		await db
			.delete(users)
			.where(eq(users.id, testUserId))
			.catch(() => {})
		await db
			.delete(users)
			.where(eq(users.id, secondUserId))
			.catch(() => {})
	})

	describe('createAccessLevel', () => {
		it('should create access level', async () => {
			const accessLevel = await adminService.createAccessLevel(
				{ accessLevel: TEST_ACCESS_LEVEL, name: 'Test Access Level' },
				testUserId,
			)
			expect(accessLevel).toBeDefined()
			expect(accessLevel.accessLevel).toBe(TEST_ACCESS_LEVEL)
			expect(accessLevel.name).toBe('Test Access Level')
		})
	})

	describe('getAccessLevels', () => {
		it('should return access levels including created', async () => {
			const levels = await adminService.getAccessLevels()
			expect(levels.some(l => l.accessLevel === TEST_ACCESS_LEVEL)).toBe(true)
		})
	})

	describe('updateAccessLevel', () => {
		it('should update access level name', async () => {
			const updated = await adminService.updateAccessLevel(
				TEST_ACCESS_LEVEL,
				{ name: 'Test Access Level Updated' },
				testUserId,
			)
			expect(updated.name).toBe('Test Access Level Updated')
		})
	})

	describe('createFunctionality', () => {
		it('should create functionality', async () => {
			const func = await adminService.createFunctionality(
				{ name: 'Test Functionality', description: 'Test description' },
				testUserId,
			)
			expect(func).toBeDefined()
			expect(func.name).toBe('Test Functionality')
			expect(func.description).toBe('Test description')
			testFunctionalityId = func.id
		})
	})

	describe('getFunctionalities', () => {
		it('should return functionalities including created', async () => {
			const funcs = await adminService.getFunctionalities()
			expect(funcs.some(f => f.id === testFunctionalityId)).toBe(true)
		})
	})

	describe('updateFunctionality', () => {
		it('should update functionality name', async () => {
			const updated = await adminService.updateFunctionality(
				testFunctionalityId,
				{ name: 'Test Functionality Updated' },
				testUserId,
			)
			expect(updated.name).toBe('Test Functionality Updated')
		})
	})

	describe('createPermission', () => {
		it('should create permission', async () => {
			const permission = await adminService.createPermission(
				{ name: 'Test Permission', functionalityId: testFunctionalityId, accessLevelId: TEST_ACCESS_LEVEL },
				testUserId,
			)
			expect(permission).toBeDefined()
			expect(permission.name).toBe('Test Permission')
			expect(permission.functionalityId).toBe(testFunctionalityId)
			expect(permission.accessLevelId).toBe(TEST_ACCESS_LEVEL)
			testPermissionId = permission.id
		})
	})

	describe('getPermissionsAll', () => {
		it('should return permissions including created', async () => {
			const result = await adminService.getPermissionsAll()
			expect(result.data.some(p => p.id === testPermissionId)).toBe(true)
		})
	})

	describe('getPermissionsSearch', () => {
		it('should find permission by name', async () => {
			const result = await adminService.getPermissionsSearch({ name: 'Test Permission', page: 1, limit: 20 })
			expect(result.data.some(p => p.id === testPermissionId)).toBe(true)
		})

		it('should find permissions by functionalityId', async () => {
			const result = await adminService.getPermissionsSearch({
				functionalityId: testFunctionalityId,
				page: 1,
				limit: 20,
			})
			expect(result.data.some(p => p.id === testPermissionId)).toBe(true)
		})

		it('should return empty for non-existent name', async () => {
			const result = await adminService.getPermissionsSearch({
				name: 'NonExistentPermission12345',
				page: 1,
				limit: 20,
			})
			expect(result.data.some(p => p.id === testPermissionId)).toBe(false)
		})
	})

	describe('getPermissionById', () => {
		it('should return permission by id', async () => {
			const permission = await adminService.getPermissionById(testPermissionId)
			expect(permission).toBeDefined()
			expect(permission?.id).toBe(testPermissionId)
		})

		it('should return null for non-existent id', async () => {
			const result = await adminService.getPermissionById('00000000-0000-0000-0000-000000000000')
			expect(result).toBeNull()
		})
	})

	describe('updatePermission', () => {
		it('should update permission name', async () => {
			const updated = await adminService.updatePermission(
				testPermissionId,
				{ name: 'Test Permission Updated' },
				testUserId,
			)
			expect(updated.name).toBe('Test Permission Updated')
		})
	})

	describe('assignPermissionToUser', () => {
		it('should assign permission to user', async () => {
			await adminService.assignPermissionToUser({ userId: secondUserId, permissionId: testPermissionId }, testUserId)
			const [record] = await db.select().from(userPermissions).where(eq(userPermissions.userId, secondUserId)).limit(1)
			expect(record).toBeDefined()
			expect(record.permissionId).toBe(testPermissionId)
		})
	})

	describe('revokePermissionFromUser', () => {
		it('should revoke permission from user', async () => {
			await adminService.revokePermissionFromUser({ userId: secondUserId, permissionId: testPermissionId }, testUserId)
			const [record] = await db.select().from(userPermissions).where(eq(userPermissions.userId, secondUserId)).limit(1)
			expect(record).toBeUndefined()
		})
	})

	describe('deletePermission', () => {
		it('should delete permission', async () => {
			const perm = await adminService.createPermission(
				{
					name: 'Test Functionality Delete Perm',
					functionalityId: testFunctionalityId,
					accessLevelId: TEST_ACCESS_LEVEL,
				},
				testUserId,
			)
			await adminService.deletePermission(perm.id, testUserId)
			const result = await adminService.getPermissionById(perm.id)
			expect(result).toBeNull()
		})
	})

	describe('deleteFunctionality', () => {
		it('should delete functionality', async () => {
			const func = await adminService.createFunctionality({ name: 'Test Functionality Delete' }, testUserId)
			await adminService.deleteFunctionality(func.id, testUserId)
			const funcs = await adminService.getFunctionalities()
			expect(funcs.some(f => f.id === func.id)).toBe(false)
		})
	})

	describe('deleteAccessLevel', () => {
		it('should delete access level', async () => {
			await adminService.createAccessLevel(
				{ accessLevel: TEST_ACCESS_LEVEL_DELETE, name: 'Test Access Level Delete' },
				testUserId,
			)
			await adminService.deleteAccessLevel(TEST_ACCESS_LEVEL_DELETE, testUserId)
			const levels = await adminService.getAccessLevels()
			expect(levels.some(l => l.accessLevel === TEST_ACCESS_LEVEL_DELETE)).toBe(false)
		})
	})
})
