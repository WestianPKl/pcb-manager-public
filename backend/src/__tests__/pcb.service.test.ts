import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '../db/index.js'
import {
	auditLog,
	inventory,
	inventoryStock,
	inventoryStockMovement,
	inventoryType,
	pcb,
	pcbBomItems,
	projects,
	sessions,
	users,
} from '../db/schema/index.js'
import { pcbService } from '../modules/pcb/pcb.service.js'
import { inventoryService } from '../modules/inventory/inventory.service.js'
import { projectsService } from '../modules/projects/projects.service.js'
import { authService } from '../modules/auth/auth.service.js'
import { eq, like } from 'drizzle-orm'

let testUserId: string
let testProjectId: string
let testPcbId: string
let testInventoryId: string
let testInventoryTypeId: string

async function cleanupBomData() {
	const testPcbs = await db.select({ id: pcb.id }).from(pcb).where(like(pcb.name, 'PCB Test%'))
	for (const p of testPcbs) {
		await db
			.delete(pcbBomItems)
			.where(eq(pcbBomItems.pcbId, p.id))
			.catch(() => {})
	}
	await db
		.delete(pcb)
		.where(like(pcb.name, 'PCB Test%'))
		.catch(() => {})
	await db
		.delete(projects)
		.where(like(projects.name, 'PCB Test Project%'))
		.catch(() => {})
}

async function cleanupBomInventory() {
	const items = await db.select({ id: inventory.id }).from(inventory).where(like(inventory.name, 'PCB Test Inventory%'))
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
		.where(like(inventory.name, 'PCB Test Inventory%'))
		.catch(() => {})
	await db
		.delete(inventoryType)
		.where(like(inventoryType.name, 'PCB Test Type%'))
		.catch(() => {})
}

describe('pcbService', () => {
	beforeAll(async () => {
		await cleanupBomData()
		await cleanupBomInventory()

		const user = await authService.register({
			username: `pcbtest_${Date.now()}`,
			name: 'PCB',
			surname: 'Test',
			email: `pcbtest_${Date.now()}@pcbmanager.com`,
			password: 'TestPassword123!',
		})
		testUserId = user.id

		const project = await projectsService.create(
			{ name: 'PCB Test Project', description: 'Test project for BOM tests' },
			testUserId,
		)
		testProjectId = project.id

		const pcbItem = await pcbService.create(
			{ projectId: testProjectId, name: 'PCB Test Board', revision: '1.0.0', verified: false },
			testUserId,
		)
		testPcbId = pcbItem.id

		const type = await inventoryService.createType({ name: 'PCB Test Type' }, testUserId)
		testInventoryTypeId = type.id

		const inv = await inventoryService.create(
			{
				name: 'PCB Test Inventory',
				manufacturerNumber: 'PCBI-001',
				lowThreshold: 0,
				inventoryTypeId: testInventoryTypeId,
			},
			testUserId,
		)
		testInventoryId = inv.id
	})

	afterAll(async () => {
		await cleanupBomData()
		await cleanupBomInventory()
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

	describe('getById', () => {
		it('should return PCB by id', async () => {
			const item = await pcbService.getById(testPcbId)
			expect(item).toBeDefined()
			expect(item?.id).toBe(testPcbId)
			expect(item?.name).toBe('PCB Test Board')
			expect(item?.projectId).toBe(testProjectId)
		})

		it('should return null for non-existent id', async () => {
			const result = await pcbService.getById('00000000-0000-0000-0000-000000000000')
			expect(result).toBeNull()
		})
	})

	describe('search', () => {
		it('should find PCB by name', async () => {
			const result = await pcbService.getAll(1, 20, { name: 'PCB Test Board' })
			expect(result.data.some(p => p.id === testPcbId)).toBe(true)
		})

		it('should find PCBs by projectId', async () => {
			const result = await pcbService.getAll(1, 20, { projectId: testProjectId })
			expect(result.data.some(p => p.id === testPcbId)).toBe(true)
		})

		it('should return empty for non-existent name', async () => {
			const result = await pcbService.getAll(1, 20, { name: 'NonExistentPCBBoard12345' })
			expect(result.data.length).toBe(0)
			expect(result.pagination.total).toBe(0)
		})

		it('should filter by verified=false', async () => {
			const result = await pcbService.getAll(1, 20, { projectId: testProjectId, verified: false })
			expect(result.data.some(p => p.id === testPcbId)).toBe(true)
			expect(result.data.every(p => p.verified === false)).toBe(true)
		})
	})

	describe('getBom', () => {
		it('should return empty BOM for new PCB', async () => {
			const bom = await pcbService.getBom(testPcbId)
			expect(Array.isArray(bom)).toBe(true)
			expect(bom.length).toBe(0)
		})
	})

	describe('addBomItem', () => {
		it('should add item to BOM', async () => {
			const item = await pcbService.addBomItem(
				testPcbId,
				{ inventoryId: testInventoryId, qtyPerBoard: 2, allowSubstitute: false, designators: 'R1,R2' },
				testUserId,
			)
			expect(item).toBeDefined()
			expect(item.pcbId).toBe(testPcbId)
			expect(item.inventoryId).toBe(testInventoryId)
			expect(item.qtyPerBoard).toBe(2)
			expect(item.designators).toBe('R1,R2')
			expect(item.allowSubstitute).toBe(false)
		})

		it('should appear in getBom after adding', async () => {
			const bom = await pcbService.getBom(testPcbId)
			expect(bom.length).toBe(1)
			expect(bom[0].inventoryId).toBe(testInventoryId)
			expect(bom[0].qtyPerBoard).toBe(2)
			expect(bom[0].inventoryName).toBe('PCB Test Inventory')
		})
	})

	describe('updateBomItem', () => {
		it('should update BOM item fields', async () => {
			const bom = await pcbService.getBom(testPcbId)
			const bomItemId = bom[0].id
			const updated = await pcbService.updateBomItem(
				bomItemId,
				{ qtyPerBoard: 5, designators: 'R1,R2,R3,R4,R5', valueSpec: '10k 5%' },
				testUserId,
			)
			expect(updated?.qtyPerBoard).toBe(5)
			expect(updated?.designators).toBe('R1,R2,R3,R4,R5')
			expect(updated?.valueSpec).toBe('10k 5%')
		})
	})

	describe('deleteBomItem', () => {
		it('should delete BOM item', async () => {
			const bom = await pcbService.getBom(testPcbId)
			const bomItemId = bom[0].id
			await pcbService.deleteBomItem(bomItemId, testUserId)

			const [deleted] = await db.select().from(pcbBomItems).where(eq(pcbBomItems.id, bomItemId)).limit(1)
			expect(deleted).toBeUndefined()
		})

		it('should return empty BOM after deleting all items', async () => {
			const bom = await pcbService.getBom(testPcbId)
			expect(bom.length).toBe(0)
		})
	})
})
