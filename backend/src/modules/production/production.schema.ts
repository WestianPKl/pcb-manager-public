import { z } from 'zod'

export const createProductionOrderSchema = z.object({
	pcbId: z.string().uuid(),
	quantity: z.number().int().min(1),
})

export const updateProductionOrderSchema = z.object({
	quantity: z.number().int().min(1).optional(),
	status: z.enum(['planned', 'ready', 'reserved', 'in_assembly', 'produced', 'cancelled']).optional(),
})

export const searchProductionOrderSchema = createProductionOrderSchema.partial().extend({
	status: z.enum(['planned', 'ready', 'reserved', 'in_assembly', 'produced', 'cancelled']).optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const createOrderItemSchema = z.object({
	inventoryId: z.string().uuid(),
	qtyPerBoard: z.number().int().min(1),
	requiredQtyTotal: z.number().int().min(1),
	designators: z.string().max(255).optional(),
	allowSubstitute: z.boolean().default(false),
})

export const updateOrderItemSchema = z.object({
	qtyPerBoard: z.number().int().min(1).optional(),
	requiredQtyTotal: z.number().int().min(1).optional(),
	consumedQty: z.number().int().min(0).optional(),
	designators: z.string().max(255).optional(),
	allowSubstitute: z.boolean().optional(),
	status: z.enum(['ok', 'low', 'missing']).optional(),
})

export type CreateProductionOrderInput = z.infer<typeof createProductionOrderSchema>
export type UpdateProductionOrderInput = z.infer<typeof updateProductionOrderSchema>
export type SearchProductionOrderInput = z.infer<typeof searchProductionOrderSchema>
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>
export type UpdateOrderItemInput = z.infer<typeof updateOrderItemSchema>
