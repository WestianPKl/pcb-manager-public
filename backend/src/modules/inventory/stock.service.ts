import { eq, and, sql } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { inventory, inventoryStock, inventoryStockMovement, users } from '../../db/schema/index.js'
import type { AddStockInput, RemoveStockInput, SearchMovementsInput } from './stock.schema.js'
import { alias } from 'drizzle-orm/pg-core'

const createdByUser = alias(users, 'created_by_user')
const updatedByUser = alias(users, 'updated_by_user')

export const stockService = {
	async getStock(inventoryId: string) {
		const [stock] = await db
			.select({
				inventoryId: inventoryStock.inventoryId,
				inventoryName: inventory.name,
				quantity: inventoryStock.quantity,
				updatedAt: inventoryStock.updatedAt,
				updatedById: inventoryStock.updatedById,
				updatedBy: updatedByUser.name,
			})
			.from(inventoryStock)
			.leftJoin(inventory, eq(inventory.id, inventoryStock.inventoryId))
			.leftJoin(updatedByUser, eq(updatedByUser.id, inventoryStock.updatedById))
			.where(eq(inventoryStock.inventoryId, inventoryId))
			.limit(1)

		return stock ?? null
	},

	async addStock(inventoryId: string, input: AddStockInput, userId: string) {
		await db.transaction(async tx => {
			await tx
				.update(inventoryStock)
				.set({
					quantity: sql`${inventoryStock.quantity} + ${input.quantity}`,
					updatedById: userId,
					updatedAt: new Date(),
				})
				.where(eq(inventoryStock.inventoryId, inventoryId))

			await tx.insert(inventoryStockMovement).values({
				inventoryId,
				delta: input.quantity,
				reason: input.reason,
				note: input.note,
				createdById: userId,
			})
		})

		return this.getStock(inventoryId)
	},

	async removeStock(inventoryId: string, input: RemoveStockInput, userId: string) {
		const stock = await this.getStock(inventoryId)

		if (!stock) {
			throw new Error('STOCK_NOT_FOUND')
		}

		if (stock.quantity < input.quantity) {
			throw new Error('INSUFFICIENT_STOCK')
		}

		await db.transaction(async tx => {
			await tx
				.update(inventoryStock)
				.set({
					quantity: sql`${inventoryStock.quantity} - ${input.quantity}`,
					updatedById: userId,
					updatedAt: new Date(),
				})
				.where(eq(inventoryStock.inventoryId, inventoryId))
			await tx.insert(inventoryStockMovement).values({
				inventoryId,
				delta: -input.quantity,
				reason: input.reason,
				note: input.note,
				createdById: userId,
			})
		})

		return this.getStock(inventoryId)
	},

	async getMovements(input: SearchMovementsInput) {
		const conditions = []
		const offset = (input.page - 1) * input.limit

		if (input.inventoryId) conditions.push(eq(inventoryStockMovement.inventoryId, input.inventoryId))
		if (input.reason) conditions.push(eq(inventoryStockMovement.reason, input.reason))

		const where = conditions.length > 0 ? and(...conditions) : undefined

		const [data, countResult] = await Promise.all([
			db
				.select({
					id: inventoryStockMovement.id,
					inventoryId: inventoryStockMovement.inventoryId,
					inventoryName: inventory.name,
					delta: inventoryStockMovement.delta,
					reason: inventoryStockMovement.reason,
					note: inventoryStockMovement.note,
					createdAt: inventoryStockMovement.createdAt,
					createdById: inventoryStockMovement.createdById,
					createdBy: createdByUser.name,
				})
				.from(inventoryStockMovement)
				.leftJoin(inventory, eq(inventory.id, inventoryStockMovement.inventoryId))
				.leftJoin(createdByUser, eq(createdByUser.id, inventoryStockMovement.createdById))
				.where(where)
				.orderBy(inventoryStockMovement.createdAt)
				.limit(input.limit)
				.offset(offset),

			db
				.select({ count: sql<number>`cast(count(*) as integer)` })
				.from(inventoryStockMovement)
				.where(where),
		])

		return {
			data,
			pagination: {
				page: input.page,
				limit: input.limit,
				total: countResult[0].count,
				totalPages: Math.ceil(countResult[0].count / input.limit),
				hasNext: input.page < Math.ceil(countResult[0].count / input.limit),
				hasPrev: input.page > 1,
			},
		}
	},
}
