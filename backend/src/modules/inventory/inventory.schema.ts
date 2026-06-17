import { z } from 'zod'

export const dictionarySchema = z.object({
	name: z.string().min(1).max(45),
})

export type DictionaryInput = z.infer<typeof dictionarySchema>

export const createInventorySchema = z.object({
	name: z.string().min(1).max(45),
	manufacturerNumber: z.string().max(200).optional(),
	parameters: z.record(z.string(), z.any()).optional(),
	comment: z.string().max(255).optional(),
	lowThreshold: z.number().int().min(0).default(0),
	inventoryTypeId: z.string().uuid().optional(),
	inventorySurfaceMountId: z.string().uuid().optional(),
	inventoryPackageId: z.string().uuid().optional(),
	inventoryShopId: z.string().uuid().optional(),
})

export const updateInventorySchema = createInventorySchema.partial()

export const searchInventorySchema = createInventorySchema.partial().extend({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(1000).default(20),
})

export type CreateInventoryInput = z.infer<typeof createInventorySchema>
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>
export type SearchInventoryInput = z.infer<typeof searchInventorySchema>
