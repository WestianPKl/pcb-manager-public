import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '../db/index.js'
import {
	auditLog,
	inventory,
	inventoryStock,
	inventoryStockMovement,
	inventoryType,
	sessions,
	users,
} from '../db/schema/index.js'
import { inventoryService } from '../modules/inventory/inventory.service.js'
import { stockService } from '../modules/inventory/stock.service.js'
import { authService } from '../modules/auth/auth.service.js'
import { eq, like } from 'drizzle-orm'

let testUserId: string
let testInventoryId: string
let testInventoryTypeId: string

async function cleanupStockData() {
	const items = await db.select({ id: inventory.id }).from(inventory).where(like(inventory.name, 'Test Stock%'))
	for (const item of items) {
		await db
			.delete(inventoryStockMovement)
			.where(eq(inventoryStockMovement.inventoryId, item.id))
			.catch(() => {})
		await db
			.delete(inventoryStock)
			.where(eq(inventoryStock.inventoryId, item.id))
			.catch(() => {})
	}
	await db
		.delete(inventory)
		.where(like(inventory.name, 'Test Stock%'))
		.catch(() => {})
	await db
		.delete(inventoryType)
		.where(like(inventoryType.name, 'Test Stock Type%'))
		.catch(() => {})
}

describe('stockService', () => {
	beforeAll(async () => {
		await cleanupStockData()

		const user = await authService.register({
			username: `stocktest_${Date.now()}`,
			name: 'Stock',
			surname: 'Test',
			email: `stocktest_${Date.now()}@pcbmanager.com`,
			password: 'TestPassword123!',
		})
		testUserId = user.id

		const type = await inventoryService.createType({ name: 'Test Stock Type' }, testUserId)
		testInventoryTypeId = type.id

		const item = await inventoryService.create(
			{
				name: 'Test Stock Item',
				manufacturerNumber: 'TSI-001',
				lowThreshold: 5,
				inventoryTypeId: testInventoryTypeId,
			},
			testUserId,
		)
		testInventoryId = item.id
	})

	afterAll(async () => {
		await cleanupStockData()
		await db
			.delete(sessions)
			.where(eq(sessions.userId, testUserId))
			.catch(() => {})
		await db
			.delete(auditLog)
			.where(eq(auditLog.userId, testUserId))
			.catch(() => {})
		await db
			.delete(users)
			.where(eq(users.id, testUserId))
			.catch(() => {})
	})

	describe('getStock', () => {
		it('should return stock with quantity 0 for new item', async () => {
			const stock = await stockService.getStock(testInventoryId)
			expect(stock).toBeDefined()
			expect(stock?.quantity).toBe(0)
			expect(stock?.inventoryId).toBe(testInventoryId)
		})

		it('should return null for non-existent inventory', async () => {
			const result = await stockService.getStock('00000000-0000-0000-0000-000000000000')
			expect(result).toBeNull()
		})
	})

	describe('addStock', () => {
		it('should add stock and return updated quantity', async () => {
			const stock = await stockService.addStock(testInventoryId, { quantity: 50, reason: 'purchase' }, testUserId)
			expect(stock?.quantity).toBe(50)
		})

		it('should record a positive stock movement', async () => {
			const movements = await db
				.select()
				.from(inventoryStockMovement)
				.where(eq(inventoryStockMovement.inventoryId, testInventoryId))
			expect(movements.some(m => m.delta === 50 && m.reason === 'purchase')).toBe(true)
		})

		it('should accumulate stock on multiple additions', async () => {
			await stockService.addStock(testInventoryId, { quantity: 10, reason: 'correction' }, testUserId)
			const stock = await stockService.getStock(testInventoryId)
			expect(stock?.quantity).toBe(60)
		})
	})

	describe('removeStock', () => {
		it('should remove stock and return updated quantity', async () => {
			const stock = await stockService.removeStock(testInventoryId, { quantity: 20, reason: 'correction' }, testUserId)
			expect(stock?.quantity).toBe(40)
		})

		it('should record a negative stock movement', async () => {
			const movements = await db
				.select()
				.from(inventoryStockMovement)
				.where(eq(inventoryStockMovement.inventoryId, testInventoryId))
			expect(movements.some(m => m.delta === -20 && m.reason === 'correction')).toBe(true)
		})

		it('should throw INSUFFICIENT_STOCK when quantity exceeds available stock', async () => {
			await expect(
				stockService.removeStock(testInventoryId, { quantity: 9999, reason: 'adjustment' }, testUserId),
			).rejects.toThrow('INSUFFICIENT_STOCK')
		})

		it('should throw STOCK_NOT_FOUND for non-existent inventory', async () => {
			await expect(
				stockService.removeStock(
					'00000000-0000-0000-0000-000000000000',
					{ quantity: 1, reason: 'adjustment' },
					testUserId,
				),
			).rejects.toThrow('STOCK_NOT_FOUND')
		})
	})

	describe('getMovements', () => {
		it('should return movements for inventory item', async () => {
			const result = await stockService.getMovements({ inventoryId: testInventoryId, page: 1, limit: 20 })
			expect(result.data.length).toBeGreaterThan(0)
			expect(result.data.every(m => m.inventoryId === testInventoryId)).toBe(true)
		})

		it('should filter movements by reason', async () => {
			const result = await stockService.getMovements({
				inventoryId: testInventoryId,
				reason: 'purchase',
				page: 1,
				limit: 20,
			})
			expect(result.data.length).toBeGreaterThan(0)
			expect(result.data.every(m => m.reason === 'purchase')).toBe(true)
		})

		it('should return empty for non-existent inventory', async () => {
			const result = await stockService.getMovements({
				inventoryId: '00000000-0000-0000-0000-000000000000',
				page: 1,
				limit: 20,
			})
			expect(result.data.length).toBe(0)
			expect(result.pagination.total).toBe(0)
		})

		it('should support pagination', async () => {
			const result = await stockService.getMovements({ inventoryId: testInventoryId, page: 1, limit: 2 })
			expect(result.pagination.page).toBe(1)
			expect(result.pagination.limit).toBe(2)
			expect(result.data.length).toBeLessThanOrEqual(2)
		})
	})
})
