import { z } from 'zod'

export const addStockSchema = z.object({
	quantity: z.number().int().min(1),
	reason: z.enum(['initial', 'purchase', 'correction', 'adjustment']),
	note: z.string().max(255).optional(),
})

export const removeStockSchema = z.object({
	quantity: z.number().int().min(1),
	reason: z.enum(['correction', 'adjustment']),
	note: z.string().max(255).optional(),
})

export const searchMovementsSchema = z.object({
	inventoryId: z.string().uuid().optional(),
	reason: z.enum(['initial', 'purchase', 'production', 'correction', 'adjustment']).optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type AddStockInput = z.infer<typeof addStockSchema>
export type RemoveStockInput = z.infer<typeof removeStockSchema>
export type SearchMovementsInput = z.infer<typeof searchMovementsSchema>
