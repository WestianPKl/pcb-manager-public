import { z } from 'zod'

export const createPcbSchema = z.object({
	projectId: z.string().uuid(),
	name: z.string().min(1).max(255),
	revision: z.string().min(1).max(45),
	topUrl: z.string().url().optional(),
	bottomUrl: z.string().url().optional(),
	comment: z.string().max(255).optional(),
	verified: z.boolean().default(false),
})

export const updatePcbSchema = createPcbSchema.partial()

export const searchPcbSchema = z.object({
	name: z.string().optional(),
	projectId: z.string().uuid().optional(),
	verified: z.boolean().optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const createBomItemSchema = z.object({
	inventoryId: z.string().uuid(),
	qtyPerBoard: z.number().int().min(1),
	designators: z.string().max(255).optional(),
	valueSpec: z.string().max(255).optional(),
	allowSubstitute: z.boolean().default(false),
	comment: z.string().max(255).optional(),
})

export const updateBomItemSchema = createBomItemSchema.partial()

export type CreatePcbInput = z.infer<typeof createPcbSchema>
export type UpdatePcbInput = z.infer<typeof updatePcbSchema>
export type SearchPcbInput = z.infer<typeof searchPcbSchema>
export type CreateBomItemInput = z.infer<typeof createBomItemSchema>
export type UpdateBomItemInput = z.infer<typeof updateBomItemSchema>
