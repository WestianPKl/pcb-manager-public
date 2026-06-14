import { z } from 'zod'

export const createAccessLevelsSchema = z.object({
	accessLevel: z.int().min(0).max(10),
	name: z.string().min(1).max(45),
})

export const updateAccessLevelsSchema = createAccessLevelsSchema.partial()

export type CreateAccessLevelsInput = z.infer<typeof createAccessLevelsSchema>
export type UpdateAccessLevelsInput = z.infer<typeof updateAccessLevelsSchema>

export const createFunctionalitySchema = z.object({
	name: z.string().min(1).max(45),
	description: z.string().max(255).optional(),
})

export const updateFunctionalitySchema = createFunctionalitySchema.partial()

export type CreateFunctionalityInput = z.infer<typeof createFunctionalitySchema>
export type UpdateFunctionalityInput = z.infer<typeof updateFunctionalitySchema>

export const createPermissionsSchema = z.object({
	name: z.string().min(1).max(45),
	functionalityId: z.string().uuid(),
	accessLevelId: z.int().min(0).max(10),
})

export const updatePermissionsSchema = createPermissionsSchema.partial()

export type CreatePermissionsInput = z.infer<typeof createPermissionsSchema>
export type UpdatePermissionsInput = z.infer<typeof updatePermissionsSchema>

export const searchPermissionsSchema = z.object({
	name: z.string().min(1).max(45).optional(),
	functionalityId: z.string().uuid().optional(),
	accessLevelId: z.int().min(0).max(10).optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type SearchPermissionsInput = z.infer<typeof searchPermissionsSchema>

export const assignPermissionToUserSchema = z.object({
	userId: z.string().uuid(),
	permissionId: z.string().uuid(),
})

export type AssignPermissionToUserInput = z.infer<typeof assignPermissionToUserSchema>
