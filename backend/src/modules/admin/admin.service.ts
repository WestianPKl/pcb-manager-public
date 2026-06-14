import { and, ilike, eq, sql } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { permissions, permissionFunctionality, permissionAccessLevel, userPermissions } from '../../db/schema/index.js'
import { users } from '../../db/schema/users.js'
import type {
	CreateAccessLevelsInput,
	UpdateAccessLevelsInput,
	CreateFunctionalityInput,
	UpdateFunctionalityInput,
	CreatePermissionsInput,
	UpdatePermissionsInput,
	AssignPermissionToUserInput,
	SearchPermissionsInput,
} from './admin.schema.js'
import { audit } from '../../utils/audit.js'

export const adminService = {
	async getAccessLevels() {
		return await db.select().from(permissionAccessLevel).orderBy(permissionAccessLevel.accessLevel)
	},

	async createAccessLevel(input: CreateAccessLevelsInput, userId: string) {
		const [accessLevel] = await db
			.insert(permissionAccessLevel)
			.values({ name: input.name, accessLevel: input.accessLevel })
			.returning()

		await audit({
			userId,
			action: 'CREATE',
			table: 'permission_access_level',
			recordId: accessLevel.accessLevel.toString(),
			newValue: accessLevel,
		})
		return accessLevel
	},

	async updateAccessLevel(accessLevelId: number, input: UpdateAccessLevelsInput, userId: string) {
		const [accessLevel] = await db
			.update(permissionAccessLevel)
			.set(input)
			.where(eq(permissionAccessLevel.accessLevel, accessLevelId))
			.returning()

		await audit({
			userId,
			action: 'UPDATE',
			table: 'permission_access_level',
			recordId: accessLevel.accessLevel.toString(),
			newValue: accessLevel,
		})
		return accessLevel
	},

	async deleteAccessLevel(accessLevelId: number, userId: string) {
		await db.delete(permissionAccessLevel).where(eq(permissionAccessLevel.accessLevel, accessLevelId))
		await audit({
			userId,
			action: 'DELETE',
			table: 'permission_access_level',
			recordId: accessLevelId.toString(),
		})
	},

	async getFunctionalities() {
		return await db.select().from(permissionFunctionality).orderBy(permissionFunctionality.name)
	},

	async createFunctionality(input: CreateFunctionalityInput, userId: string) {
		const [functionality] = await db
			.insert(permissionFunctionality)
			.values({ name: input.name, description: input.description })
			.returning()
		await audit({
			userId,
			action: 'CREATE',
			table: 'permission_functionality',
			recordId: functionality.id,
			newValue: functionality,
		})
		return functionality
	},

	async updateFunctionality(functionalityId: string, input: UpdateFunctionalityInput, userId: string) {
		const [functionality] = await db
			.update(permissionFunctionality)
			.set(input)
			.where(eq(permissionFunctionality.id, functionalityId))
			.returning()
		await audit({
			userId,
			action: 'UPDATE',
			table: 'permission_functionality',
			recordId: functionality.id,
			newValue: functionality,
		})
		return functionality
	},

	async deleteFunctionality(functionalityId: string, userId: string) {
		await db.delete(permissionFunctionality).where(eq(permissionFunctionality.id, functionalityId))
		await audit({
			userId,
			action: 'DELETE',
			table: 'permission_functionality',
			recordId: functionalityId,
		})
	},

	async getPermissionsAll(page = 1, limit = 20) {
		const offset = (page - 1) * limit

		const permissionsData = await db.query.permissions.findMany({
			columns: {
				id: true,
				name: true,
				functionalityId: true,
				accessLevelId: true,
				createdAt: true,
				updatedAt: true,
				createdById: true,
				updatedById: true,
			},
			with: {
				functionality: {
					columns: {
						name: true,
					},
				},
				accessLevel: {
					columns: {
						name: true,
					},
				},
				createdBy: {
					columns: {
						username: true,
					},
				},
				updatedBy: {
					columns: {
						username: true,
					},
				},
				users: {
					columns: {
						userId: false,
						permissionId: false,
					},
					with: {
						user: {
							columns: {
								id: true,
								username: true,
								email: true,
								name: true,
								surname: true,
								avatar: true,
							},
						},
					},
				},
			},
			orderBy: sql`${permissions.createdAt} DESC`,
			limit: limit,
			offset,
		})

		const countResult = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(permissions)

		const data = permissionsData.map(permission => ({
			id: permission.id,
			name: permission.name,
			functionalityId: permission.functionalityId,
			accessLevelId: permission.accessLevelId,
			createdAt: permission.createdAt,
			updatedAt: permission.updatedAt,
			createdById: permission.createdById,
			updatedById: permission.updatedById,
			functionality: permission.functionality.name,
			accessLevel: permission.accessLevel.name,
			createdBy: permission.createdBy.username,
			updatedBy: permission.updatedBy.username,
			users: permission.users.map(user => ({
				id: user.user.id,
				username: user.user.username,
				email: user.user.email,
				name: user.user.name,
				surname: user.user.surname,
				avatar: user.user.avatar,
			})),
		}))

		return {
			data,
			pagination: {
				page,
				limit,
				total: countResult[0].count,
				totalPages: Math.ceil(countResult[0].count / limit),
				hasNext: page < Math.ceil(countResult[0].count / limit),
				hasPrev: page > 1,
			},
		}
	},

	async getPermissionsSearch(input: SearchPermissionsInput) {
		const conditions = []
		const offset = (input.page - 1) * input.limit

		if (input.name) conditions.push(ilike(permissions.name, `%${input.name}%`))
		if (input.functionalityId) conditions.push(eq(permissions.functionalityId, input.functionalityId))
		if (input.accessLevelId) conditions.push(eq(permissions.accessLevelId, input.accessLevelId))

		const permissionsData = await db.query.permissions.findMany({
			where: and(...conditions),
			columns: {
				id: true,
				name: true,
				functionalityId: true,
				accessLevelId: true,
				createdAt: true,
				updatedAt: true,
				createdById: true,
				updatedById: true,
			},
			with: {
				functionality: {
					columns: {
						name: true,
					},
				},
				accessLevel: {
					columns: {
						name: true,
					},
				},
				createdBy: {
					columns: {
						username: true,
					},
				},
				updatedBy: {
					columns: {
						username: true,
					},
				},
				users: {
					columns: {
						userId: false,
						permissionId: false,
					},
					with: {
						user: {
							columns: {
								id: true,
								username: true,
								email: true,
								name: true,
								surname: true,
								avatar: true,
							},
						},
					},
				},
			},
			orderBy: sql`${permissions.createdAt} DESC`,
			limit: input.limit,
			offset,
		})

		const countResult = await db
			.select({ count: sql<number>`cast(count(*) as integer)` })
			.from(permissions)
			.where(conditions.length > 0 ? and(...conditions) : undefined)

		const total = countResult[0].count

		const data = permissionsData.map(permission => ({
			id: permission.id,
			name: permission.name,
			functionalityId: permission.functionalityId,
			accessLevelId: permission.accessLevelId,
			createdAt: permission.createdAt,
			updatedAt: permission.updatedAt,
			createdById: permission.createdById,
			updatedById: permission.updatedById,
			functionality: permission.functionality.name,
			accessLevel: permission.accessLevel.name,
			createdBy: permission.createdBy.username,
			updatedBy: permission.updatedBy.username,
			users: permission.users.map(user => ({
				id: user.user.id,
				username: user.user.username,
				email: user.user.email,
				name: user.user.name,
				surname: user.user.surname,
				avatar: user.user.avatar,
			})),
		}))

		return {
			data,
			pagination: {
				page: input.page,
				limit: input.limit,
				total,
				totalPages: Math.ceil(total / input.limit),
				hasNext: input.page < Math.ceil(total / input.limit),
				hasPrev: input.page > 1,
			},
		}
	},

	async getPermissionById(permissionId: string) {
		const [permissionsData] = await db.query.permissions.findMany({
			where: eq(permissions.id, permissionId),
			columns: {
				id: true,
				name: true,
				functionalityId: true,
				accessLevelId: true,
				createdAt: true,
				updatedAt: true,
				createdById: true,
				updatedById: true,
			},
			with: {
				functionality: {
					columns: {
						name: true,
					},
				},
				accessLevel: {
					columns: {
						name: true,
					},
				},
				createdBy: {
					columns: {
						username: true,
					},
				},
				updatedBy: {
					columns: {
						username: true,
					},
				},
				users: {
					columns: {
						userId: false,
						permissionId: false,
					},
					with: {
						user: {
							columns: {
								id: true,
								username: true,
								email: true,
								name: true,
								surname: true,
								avatar: true,
							},
						},
					},
				},
			},
		})

		if (!permissionsData) return null

		const data = {
			id: permissionsData.id,
			name: permissionsData.name,
			functionalityId: permissionsData.functionalityId,
			accessLevelId: permissionsData.accessLevelId,
			createdAt: permissionsData.createdAt,
			updatedAt: permissionsData.updatedAt,
			createdById: permissionsData.createdById,
			updatedById: permissionsData.updatedById,
			functionality: permissionsData.functionality.name,
			accessLevel: permissionsData.accessLevel.name,
			createdBy: permissionsData.createdBy.username,
			updatedBy: permissionsData.updatedBy.username,
			users: permissionsData.users.map(user => ({
				id: user.user.id,
				username: user.user.username,
				email: user.user.email,
				name: user.user.name,
				surname: user.user.surname,
				avatar: user.user.avatar,
			})),
		}

		return data ?? null
	},

	async createPermission(input: CreatePermissionsInput, userId: string) {
		const [permission] = await db
			.insert(permissions)
			.values({ ...input, createdById: userId, updatedById: userId })
			.returning()
		await audit({
			userId,
			action: 'CREATE',
			table: 'permissions',
			recordId: permission.id,
			newValue: permission,
		})
		return permission
	},

	async updatePermission(permissionId: string, input: UpdatePermissionsInput, userId: string) {
		const [permission] = await db
			.update(permissions)
			.set({ ...input, updatedById: userId })
			.where(eq(permissions.id, permissionId))
			.returning()
		await audit({
			userId,
			action: 'UPDATE',
			table: 'permissions',
			recordId: permission.id,
			newValue: permission,
		})
		return permission
	},

	async deletePermission(permissionId: string, userId: string) {
		await db.delete(permissions).where(eq(permissions.id, permissionId))
		await audit({
			userId,
			action: 'DELETE',
			table: 'permissions',
			recordId: permissionId,
		})
	},

	async assignPermissionToUser(input: AssignPermissionToUserInput, userId: string) {
		await db
			.insert(userPermissions)
			.values({
				userId: input.userId,
				permissionId: input.permissionId,
			})
			.returning()
		await audit({
			userId,
			action: 'CREATE',
			table: 'user_permissions',
			recordId: input.permissionId,
			newValue: input,
		})
	},

	async revokePermissionFromUser(input: AssignPermissionToUserInput, userId: string) {
		await db
			.delete(userPermissions)
			.where(and(eq(userPermissions.userId, input.userId), eq(userPermissions.permissionId, input.permissionId)))
		await audit({
			userId,
			action: 'DELETE',
			table: 'user_permissions',
			recordId: input.permissionId,
		})
	},

	async getUsersForPermission(permissionId: string) {
		return await db
			.select({
				id: users.id,
				username: users.username,
				name: users.name,
				surname: users.surname,
				email: users.email,
				avatar: users.avatar,
			})
			.from(userPermissions)
			.innerJoin(users, eq(userPermissions.userId, users.id))
			.where(eq(userPermissions.permissionId, permissionId))
			.orderBy(users.username)
	},

	async getAllUsers() {
		return await db
			.select({
				id: users.id,
				username: users.username,
				name: users.name,
				surname: users.surname,
				email: users.email,
				avatar: users.avatar,
			})
			.from(users)
			.orderBy(users.username)
	},
}
