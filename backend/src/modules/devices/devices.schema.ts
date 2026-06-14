import { z } from 'zod'

export const createDeviceSchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().max(255).optional(),
	pcbId: z.string().uuid(),
})

export const updateDeviceSchema = createDeviceSchema.partial()

export const searchDeviceSchema = z.object({
	name: z.string().optional(),
	pcbId: z.string().uuid().optional(),
	serialNumber: z.string().optional(),
	claimed: z.boolean().optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>
export type SearchDeviceInput = z.infer<typeof searchDeviceSchema>
