import { eq, and, gte } from 'drizzle-orm'
import { db } from '../db/index.js'
import { FastifyRequest } from 'fastify'
import { permissions, permissionFunctionality, permissionAccessLevel, userPermissions } from '../db/schema/index.js'

export async function permissionCheck(request: FastifyRequest, requiredPermission: string, accessLevel: string) {
	const user = request.user as { id: string }
	if (!user.id) return false

	const accessLevelResult = await db
		.select({ accessLevel: permissionAccessLevel.accessLevel })
		.from(permissionAccessLevel)
		.where(eq(permissionAccessLevel.name, accessLevel))
		.limit(1)
	if (accessLevelResult.length === 0) return false

	const result = await db
		.select({ id: userPermissions.userId })
		.from(userPermissions)
		.innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
		.innerJoin(permissionFunctionality, eq(permissions.functionalityId, permissionFunctionality.id))
		.innerJoin(permissionAccessLevel, eq(permissions.accessLevelId, permissionAccessLevel.accessLevel))
		.where(
			and(
				eq(userPermissions.userId, user.id),
				eq(permissionFunctionality.name, requiredPermission),
				gte(permissionAccessLevel.accessLevel, accessLevelResult[0].accessLevel),
			),
		)
		.limit(1)

	return result.length > 0
}
