import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '../db/index.js'
import {
	auditLog,
	inventory,
	inventoryStock,
	inventoryStockMovement,
	inventoryType,
	pcb,
	productionOrderItems,
	productionOrders,
	projects,
	sessions,
	users,
} from '../db/schema/index.js'
import { productionService } from '../modules/production/production.service.js'
import { inventoryService } from '../modules/inventory/inventory.service.js'
import { stockService } from '../modules/inventory/stock.service.js'
import { projectsService } from '../modules/projects/projects.service.js'
import { pcbService } from '../modules/pcb/pcb.service.js'
import { authService } from '../modules/auth/auth.service.js'
import { eq, like } from 'drizzle-orm'

let testUserId: string
let testProjectId: string
let testPcbId: string
let testInventoryId: string
let testInventoryTypeId: string
let testOrderId: string

async function cleanupProductionData() {
	const testPcbs = await db.select({ id: pcb.id }).from(pcb).where(like(pcb.name, 'Prod Test PCB%'))
	for (const p of testPcbs) {
		const orders = await db
			.select({ id: productionOrders.id })
			.from(productionOrders)
			.where(eq(productionOrders.pcbId, p.id))
		for (const order of orders) {
			await db
				.delete(productionOrderItems)
				.where(eq(productionOrderItems.productionOrderId, order.id))
				.catch(() => {})
			await db
				.delete(productionOrders)
				.where(eq(productionOrders.id, order.id))
				.catch(() => {})
		}
	}
}

async function cleanupPcbAndProjectData() {
	await db
		.delete(pcb)
		.where(like(pcb.name, 'Prod Test PCB%'))
		.catch(() => {})
	await db
		.delete(projects)
		.where(like(projects.name, 'Prod Test Project%'))
		.catch(() => {})
}

async function cleanupProdInventory() {
	const items = await db
		.select({ id: inventory.id })
		.from(inventory)
		.where(like(inventory.name, 'Prod Test Inventory%'))
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
		.where(like(inventory.name, 'Prod Test Inventory%'))
		.catch(() => {})
	await db
		.delete(inventoryType)
		.where(like(inventoryType.name, 'Prod Test Type%'))
		.catch(() => {})
}

describe('productionService', () => {
	beforeAll(async () => {
		await cleanupProductionData()
		await cleanupPcbAndProjectData()
		await cleanupProdInventory()

		const user = await authService.register({
			username: `prodtest_${Date.now()}`,
			name: 'Prod',
			surname: 'Test',
			email: `prodtest_${Date.now()}@pcbmanager.com`,
			password: 'TestPassword123!',
		})
		testUserId = user.id

		const project = await projectsService.create({ name: 'Prod Test Project', description: 'Test' }, testUserId)
		testProjectId = project.id

		const pcbItem = await pcbService.create(
			{ projectId: testProjectId, name: 'Prod Test PCB', revision: '1.0.0', verified: false },
			testUserId,
		)
		testPcbId = pcbItem.id

		const type = await inventoryService.createType({ name: 'Prod Test Type' }, testUserId)
		testInventoryTypeId = type.id

		const inv = await inventoryService.create(
			{
				name: 'Prod Test Inventory',
				manufacturerNumber: 'PRDI-001',
				lowThreshold: 0,
				inventoryTypeId: testInventoryTypeId,
			},
			testUserId,
		)
		testInventoryId = inv.id

		await stockService.addStock(testInventoryId, { quantity: 100, reason: 'purchase' }, testUserId)
	})

	afterAll(async () => {
		await cleanupProductionData()
		await cleanupPcbAndProjectData()
		await cleanupProdInventory()
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

	describe('create', () => {
		it('should create production order with planned status', async () => {
			const order = await productionService.create({ pcbId: testPcbId, quantity: 5 }, testUserId)
			expect(order).toBeDefined()
			expect(order.pcbId).toBe(testPcbId)
			expect(order.quantity).toBe(5)
			expect(order.status).toBe('planned')
			testOrderId = order.id
		})
	})

	describe('getAll', () => {
		it('should return list of orders including created', async () => {
			const result = await productionService.getAll()
			expect(result.data.some(o => o.id === testOrderId)).toBe(true)
		})
	})

	describe('getById', () => {
		it('should return order by id', async () => {
			const order = await productionService.getById(testOrderId)
			expect(order).toBeDefined()
			expect(order?.id).toBe(testOrderId)
			expect(order?.pcbId).toBe(testPcbId)
		})

		it('should return null for non-existent id', async () => {
			const result = await productionService.getById('00000000-0000-0000-0000-000000000000')
			expect(result).toBeNull()
		})
	})

	describe('update', () => {
		it('should update production order quantity', async () => {
			const updated = await productionService.update(testOrderId, { quantity: 10 }, testUserId)
			expect(updated?.quantity).toBe(10)
		})

		it('should update production order status', async () => {
			const updated = await productionService.update(testOrderId, { status: 'ready' }, testUserId)
			expect(updated?.status).toBe('ready')
		})
	})

	describe('search', () => {
		it('should find orders by pcbId', async () => {
			const result = await productionService.getAll(1, 20, { pcbId: testPcbId })
			expect(result.data.some(o => o.id === testOrderId)).toBe(true)
		})

		it('should find orders by status', async () => {
			const result = await productionService.getAll(1, 20, { status: 'ready' })
			expect(result.data.some(o => o.id === testOrderId)).toBe(true)
		})

		it('should not return order for non-matching status', async () => {
			const result = await productionService.getAll(1, 20, { status: 'cancelled', pcbId: testPcbId })
			expect(result.data.some(o => o.id === testOrderId)).toBe(false)
		})
	})

	describe('addItem', () => {
		it('should add item to production order', async () => {
			const item = await productionService.addItem(
				testOrderId,
				{ inventoryId: testInventoryId, qtyPerBoard: 3, requiredQtyTotal: 30, allowSubstitute: false },
				testUserId,
			)
			expect(item).toBeDefined()
			expect(item.productionOrderId).toBe(testOrderId)
			expect(item.inventoryId).toBe(testInventoryId)
			expect(item.qtyPerBoard).toBe(3)
			expect(item.requiredQtyTotal).toBe(30)
		})
	})

	describe('getItems', () => {
		it('should return items for production order', async () => {
			const items = await productionService.getItems(testOrderId)
			expect(items.length).toBe(1)
			expect(items[0].inventoryId).toBe(testInventoryId)
			expect(items[0].inventoryName).toBe('Prod Test Inventory')
		})
	})

	describe('updateItem', () => {
		it('should update production order item', async () => {
			const items = await productionService.getItems(testOrderId)
			const itemId = items[0].id
			const updated = await productionService.updateItem(
				itemId,
				{ consumedQty: 3, status: 'ok', allowSubstitute: true },
				testUserId,
			)
			expect(updated?.consumedQty).toBe(3)
			expect(updated?.status).toBe('ok')
			expect(updated?.allowSubstitute).toBe(true)
		})
	})

	describe('consume', () => {
		it('should deduct inventory stock and mark order as produced', async () => {
			await productionService.update(testOrderId, { status: 'in_assembly' }, testUserId)

			const [stockBefore] = await db
				.select()
				.from(inventoryStock)
				.where(eq(inventoryStock.inventoryId, testInventoryId))
				.limit(1)

			await productionService.consume(testOrderId, testUserId)

			const order = await productionService.getById(testOrderId)
			expect(order?.status).toBe('produced')

			const [stockAfter] = await db
				.select()
				.from(inventoryStock)
				.where(eq(inventoryStock.inventoryId, testInventoryId))
				.limit(1)
			expect(stockAfter.quantity).toBe(stockBefore.quantity - 30)
		})

		it('should set consumedQty on order items', async () => {
			const items = await productionService.getItems(testOrderId)
			expect(items[0].consumedQty).toBe(30)
		})

		it('should create stock movement with reason production', async () => {
			const movements = await db
				.select()
				.from(inventoryStockMovement)
				.where(eq(inventoryStockMovement.inventoryId, testInventoryId))
			expect(movements.some(m => m.reason === 'production' && m.delta === -30)).toBe(true)
		})
	})

	describe('deleteItem', () => {
		it('should delete a single production order item', async () => {
			const newOrder = await productionService.create({ pcbId: testPcbId, quantity: 1 }, testUserId)
			const item = await productionService.addItem(
				newOrder.id,
				{ inventoryId: testInventoryId, qtyPerBoard: 1, requiredQtyTotal: 1, allowSubstitute: false },
				testUserId,
			)
			await productionService.deleteItem(item.id, testUserId)

			const [deleted] = await db
				.select()
				.from(productionOrderItems)
				.where(eq(productionOrderItems.id, item.id))
				.limit(1)
			expect(deleted).toBeUndefined()

			await db
				.delete(productionOrders)
				.where(eq(productionOrders.id, newOrder.id))
				.catch(() => {})
		})
	})

	describe('delete', () => {
		it('should delete production order and cascade to items', async () => {
			const newOrder = await productionService.create({ pcbId: testPcbId, quantity: 2 }, testUserId)
			const item = await productionService.addItem(
				newOrder.id,
				{ inventoryId: testInventoryId, qtyPerBoard: 1, requiredQtyTotal: 2, allowSubstitute: false },
				testUserId,
			)
			await productionService.delete(newOrder.id, testUserId)

			const [deletedOrder] = await db
				.select()
				.from(productionOrders)
				.where(eq(productionOrders.id, newOrder.id))
				.limit(1)
			expect(deletedOrder).toBeUndefined()

			const [deletedItem] = await db
				.select()
				.from(productionOrderItems)
				.where(eq(productionOrderItems.id, item.id))
				.limit(1)
			expect(deletedItem).toBeUndefined()
		})
	})
})
