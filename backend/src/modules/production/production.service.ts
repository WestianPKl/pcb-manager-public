import { eq, and, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '../../db/index.js'
import {
	productionOrders,
	productionOrderItems,
	pcb,
	inventory,
	inventoryStock,
	inventoryStockMovement,
} from '../../db/schema/index.js'
import { users } from '../../db/schema/users.js'
import type {
	CreateProductionOrderInput,
	UpdateProductionOrderInput,
	SearchProductionOrderInput,
	CreateOrderItemInput,
	UpdateOrderItemInput,
} from './production.schema.js'
import { audit } from '../../utils/audit.js'

const createdByUser = alias(users, 'created_by_user')
const updatedByUser = alias(users, 'updated_by_user')

const orderSelect = {
	id: productionOrders.id,
	pcbId: productionOrders.pcbId,
	pcbName: pcb.name,
	pcbRevision: pcb.revision,
	quantity: productionOrders.quantity,
	status: productionOrders.status,
	createdAt: productionOrders.createdAt,
	updatedAt: productionOrders.updatedAt,
	createdBy: createdByUser.name,
	updatedBy: updatedByUser.name,
}

export const productionService = {
	async getAll(page = 1, limit = 20, filters: Omit<SearchProductionOrderInput, 'page' | 'limit'> = {}) {
		const offset = (page - 1) * limit

		const conditions = []
		if (filters.pcbId) conditions.push(eq(productionOrders.pcbId, filters.pcbId))
		if (filters.status) conditions.push(eq(productionOrders.status, filters.status))

		const where = conditions.length > 0 ? and(...conditions) : undefined

		const [data, countResult] = await Promise.all([
			db
				.select(orderSelect)
				.from(productionOrders)
				.leftJoin(pcb, eq(pcb.id, productionOrders.pcbId))
				.leftJoin(createdByUser, eq(createdByUser.id, productionOrders.createdById))
				.leftJoin(updatedByUser, eq(updatedByUser.id, productionOrders.updatedById))
				.where(where)
				.orderBy(productionOrders.createdAt)
				.limit(limit)
				.offset(offset),

			db.select({ count: sql<number>`cast(count(*) as integer)` }).from(productionOrders).where(where),
		])

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

	async getById(id: string) {
		const [item] = await db
			.select(orderSelect)
			.from(productionOrders)
			.leftJoin(pcb, eq(pcb.id, productionOrders.pcbId))
			.leftJoin(createdByUser, eq(createdByUser.id, productionOrders.createdById))
			.leftJoin(updatedByUser, eq(updatedByUser.id, productionOrders.updatedById))
			.where(eq(productionOrders.id, id))
			.limit(1)

		return item ?? null
	},

	async create(input: CreateProductionOrderInput, userId: string) {
		const [order] = await db
			.insert(productionOrders)
			.values({
				...input,
				status: 'planned',
				createdById: userId,
				updatedById: userId,
			})
			.returning()

		await audit({
			userId,
			action: 'CREATE',
			table: 'production_orders',
			recordId: order.id,
			newValue: order,
		})

		return order
	},

	async update(id: string, input: UpdateProductionOrderInput, userId: string) {
		const [order] = await db
			.update(productionOrders)
			.set({ ...input, updatedById: userId, updatedAt: new Date() })
			.where(eq(productionOrders.id, id))
			.returning()

		await audit({
			userId,
			action: 'UPDATE',
			table: 'production_orders',
			recordId: order.id,
			newValue: order,
		})
		return order ?? null
	},

	async delete(id: string, userId: string) {
		await db.transaction(async tx => {
			await tx.delete(productionOrderItems).where(eq(productionOrderItems.productionOrderId, id))
			await tx.delete(productionOrders).where(eq(productionOrders.id, id))
		})

		await audit({
			userId,
			action: 'DELETE',
			table: 'production_orders',
			recordId: id,
		})
	},

	async getItems(orderId: string) {
		return db
			.select({
				id: productionOrderItems.id,
				productionOrderId: productionOrderItems.productionOrderId,
				inventoryId: productionOrderItems.inventoryId,
				inventoryName: inventory.name,
				qtyPerBoard: productionOrderItems.qtyPerBoard,
				requiredQtyTotal: productionOrderItems.requiredQtyTotal,
				consumedQty: productionOrderItems.consumedQty,
				allowSubstitute: productionOrderItems.allowSubstitute,
				designators: productionOrderItems.designators,
				status: productionOrderItems.status,
			})
			.from(productionOrderItems)
			.leftJoin(inventory, eq(inventory.id, productionOrderItems.inventoryId))
			.where(eq(productionOrderItems.productionOrderId, orderId))
			.orderBy(inventory.name)
	},

	async addItem(orderId: string, input: CreateOrderItemInput, userId: string) {
		const [item] = await db
			.insert(productionOrderItems)
			.values({
				productionOrderId: orderId,
				...input,
				createdById: userId,
				updatedById: userId,
			})
			.returning()

		await audit({
			userId,
			action: 'CREATE',
			table: 'production_order_items',
			recordId: item.id,
			newValue: item,
		})

		return item
	},

	async updateItem(id: string, input: UpdateOrderItemInput, userId: string) {
		const [item] = await db
			.update(productionOrderItems)
			.set({ ...input, updatedById: userId, updatedAt: new Date() })
			.where(eq(productionOrderItems.id, id))
			.returning()

		await audit({
			userId,
			action: 'UPDATE',
			table: 'production_order_items',
			recordId: item.id,
			newValue: item,
		})
		return item ?? null
	},

	async deleteItem(id: string, userId: string) {
		await db.delete(productionOrderItems).where(eq(productionOrderItems.id, id))

		await audit({
			userId,
			action: 'DELETE',
			table: 'production_order_items',
			recordId: id,
		})
	},

	async consume(orderId: string, userId: string) {
		const items = await db
			.select()
			.from(productionOrderItems)
			.where(eq(productionOrderItems.productionOrderId, orderId))

		await db.transaction(async tx => {
			for (const item of items) {
				await tx
					.update(inventoryStock)
					.set({
						quantity: sql`${inventoryStock.quantity} - ${item.requiredQtyTotal}`,
						updatedById: userId,
						updatedAt: new Date(),
					})
					.where(eq(inventoryStock.inventoryId, item.inventoryId))

				await tx.insert(inventoryStockMovement).values({
					inventoryId: item.inventoryId,
					delta: -item.requiredQtyTotal,
					reason: 'production',
					note: `Zlecenie produkcyjne ${orderId}`,
					createdById: userId,
				})

				await tx
					.update(productionOrderItems)
					.set({ consumedQty: item.requiredQtyTotal })
					.where(eq(productionOrderItems.id, item.id))
			}

			await tx
				.update(productionOrders)
				.set({ status: 'produced', updatedById: userId, updatedAt: new Date() })
				.where(eq(productionOrders.id, orderId))
		})
	},
}
