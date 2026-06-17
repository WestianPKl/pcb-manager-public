import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '../db/index.js'
import {
	auditLog,
	inventory,
	inventoryPackage,
	inventoryShop,
	inventoryStock,
	inventoryStockMovement,
	inventorySurfaceMount,
	inventoryType,
	sessions,
	users,
} from '../db/schema/index.js'
import { inventoryService } from '../modules/inventory/inventory.service.js'
import { authService } from '../modules/auth/auth.service.js'
import { eq, like } from 'drizzle-orm'

let testUserId: string
let inventoryTypeId: string
let inventoryShopId: string
let inventoryPackageId: string
let inventorySurfaceMountId: string

function uniqueItem(suffix: string) {
	return {
		name: `Test Resistor ${suffix}`,
		manufacturerNumber: `RC-${suffix}`,
		lowThreshold: 10,
		inventoryTypeId,
		inventoryShopId,
		inventoryPackageId,
		inventorySurfaceMountId,
	}
}

function inventoryTypeItem(sufix: string) {
	return {
		name: `Test Resistor Type ${sufix}`,
	}
}

function inventoryShopItem(sufix: string) {
	return {
		name: `Test Resistor Shop ${sufix}`,
	}
}

function inventoryPackageItem(sufix: string) {
	return {
		name: `Test Resistor Package ${sufix}`,
	}
}

function inventorySurfaceMountItem(sufix: string) {
	return {
		name: `Test Resistor Surface Mount ${sufix}`,
	}
}

async function cleanupInventory() {
	const items = await db.select({ id: inventory.id }).from(inventory).where(like(inventory.name, 'Test Resistor%'))

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
		.where(like(inventory.name, 'Test Resistor%'))
		.catch(() => {})
}

async function cleanupInventoryTypes() {
	await db
		.delete(inventoryType)
		.where(like(inventoryType.name, 'Test Resistor Type%'))
		.catch(() => {})
}

async function cleanupInventoryShops() {
	await db
		.delete(inventoryShop)
		.where(like(inventoryShop.name, 'Test Resistor Shop%'))
		.catch(() => {})
}

async function cleanupInventoryPackages() {
	await db
		.delete(inventoryPackage)
		.where(like(inventoryPackage.name, 'Test Resistor Package%'))
		.catch(() => {})
}

async function cleanupInventorySurfaceMounts() {
	await db
		.delete(inventorySurfaceMount)
		.where(like(inventorySurfaceMount.name, 'Test Resistor Surface Mount%'))
		.catch(() => {})
}

describe('inventoryService', () => {
	beforeAll(async () => {
		await cleanupInventory()
		await cleanupInventoryTypes()
		await cleanupInventoryShops()
		await cleanupInventoryPackages()
		await cleanupInventorySurfaceMounts()

		const user = await authService.register({
			username: `invtest_${Date.now()}`,
			name: 'Inv',
			surname: 'Test',
			email: `invtest_${Date.now()}@pcbmanager.com`,
			password: 'TestPassword123!',
		})
		testUserId = user.id
	})

	afterAll(async () => {
		await cleanupInventory()
		await cleanupInventoryTypes()
		await cleanupInventoryShops()
		await cleanupInventoryPackages()
		await cleanupInventorySurfaceMounts()
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

	describe('createType', () => {
		it('should create inventory type', async () => {
			const type = await inventoryService.createType(inventoryTypeItem('type1'), testUserId)
			expect(type).toBeDefined()
			expect(type.name).toBe('Test Resistor Type type1')
			inventoryTypeId = type.id
		})
	})

	describe('createShop', () => {
		it('should create inventory shop', async () => {
			const shop = await inventoryService.createShop(inventoryShopItem('shop1'), testUserId)
			expect(shop).toBeDefined()
			expect(shop.name).toBe('Test Resistor Shop shop1')
			inventoryShopId = shop.id
		})
	})

	describe('createPackage', () => {
		it('should create inventory package', async () => {
			const pkg = await inventoryService.createPackage(inventoryPackageItem('package1'), testUserId)
			expect(pkg).toBeDefined()
			expect(pkg.name).toBe('Test Resistor Package package1')
			inventoryPackageId = pkg.id
		})
	})

	describe('createSurfaceMount', () => {
		it('should create inventory surface mount', async () => {
			const sm = await inventoryService.createSurfaceMount(inventorySurfaceMountItem('sm1'), testUserId)
			expect(sm).toBeDefined()
			expect(sm.name).toBe('Test Resistor Surface Mount sm1')
			inventorySurfaceMountId = sm.id
		})
	})

	describe('getTypes', () => {
		it('should return inventory types', async () => {
			const types = await inventoryService.getTypes()
			expect(types.length).toBeGreaterThan(0)
			expect(types.some(t => t.id === inventoryTypeId)).toBe(true)
		})
	})

	describe('getShops', () => {
		it('should return inventory shops', async () => {
			const shops = await inventoryService.getShops()
			expect(shops.length).toBeGreaterThan(0)
			expect(shops.some(s => s.id === inventoryShopId)).toBe(true)
		})
	})

	describe('getPackages', () => {
		it('should return inventory packages', async () => {
			const packages = await inventoryService.getPackages()
			expect(packages.length).toBeGreaterThan(0)
			expect(packages.some(p => p.id === inventoryPackageId)).toBe(true)
		})
	})

	describe('getSurfaceMounts', () => {
		it('should return inventory surface mounts', async () => {
			const sms = await inventoryService.getSurfaceMounts()
			expect(sms.length).toBeGreaterThan(0)
			expect(sms.some(sm => sm.id === inventorySurfaceMountId)).toBe(true)
		})
	})

	describe('updateType', () => {
		it('should update inventory type', async () => {
			const updated = await inventoryService.updateType(
				inventoryTypeId,
				{ name: 'Test Resistor Type updated' },
				testUserId,
			)
			expect(updated?.name).toBe('Test Resistor Type updated')
		})
	})

	describe('updateShop', () => {
		it('should update inventory shop', async () => {
			const updated = await inventoryService.updateShop(
				inventoryShopId,
				{ name: 'Test Resistor Shop updated' },
				testUserId,
			)
			expect(updated?.name).toBe('Test Resistor Shop updated')
		})
	})

	describe('updatePackage', () => {
		it('should update inventory package', async () => {
			const updated = await inventoryService.updatePackage(
				inventoryPackageId,
				{ name: 'Test Resistor Package updated' },
				testUserId,
			)
			expect(updated?.name).toBe('Test Resistor Package updated')
		})
	})

	describe('updateSurfaceMount', () => {
		it('should update inventory surface mount', async () => {
			const updated = await inventoryService.updateSurfaceMount(
				inventorySurfaceMountId,
				{ name: 'Test Resistor Surface Mount updated' },
				testUserId,
			)
			expect(updated?.name).toBe('Test Resistor Surface Mount updated')
		})
	})

	describe('create', () => {
		it('should create inventory item', async () => {
			const item = await inventoryService.create(uniqueItem('create1'), testUserId)

			expect(item).toBeDefined()
			expect(item.name).toBe('Test Resistor create1')
		})

		it('should create inventory stock with quantity 0', async () => {
			const item = await inventoryService.create(uniqueItem('create2'), testUserId)

			const [stock] = await db.select().from(inventoryStock).where(eq(inventoryStock.inventoryId, item.id)).limit(1)

			expect(stock).toBeDefined()
			expect(stock.quantity).toBe(0)
		})
	})

	describe('update', () => {
		it('should update inventory item', async () => {
			const item = await inventoryService.create(uniqueItem('update1'), testUserId)
			const updated = await inventoryService.update(item.id, { name: 'Test Resistor updated' }, testUserId)

			expect(updated?.name).toBe('Test Resistor updated')
		})

		it('should return null for non-existent item', async () => {
			const result = await inventoryService.update('00000000-0000-0000-0000-000000000000', { name: 'test' }, testUserId)
			expect(result).toBeNull()
		})
	})

	describe('delete', () => {
		it('should delete inventory item and stock', async () => {
			const item = await inventoryService.create(uniqueItem('delete1'), testUserId)
			await inventoryService.delete(item.id, testUserId)

			const [deleted] = await db.select().from(inventory).where(eq(inventory.id, item.id)).limit(1)

			expect(deleted).toBeUndefined()
		})
	})

	describe('deleteType', () => {
		it('should delete inventory type', async () => {
			const type = await inventoryService.createType(inventoryTypeItem('deleteType1'), testUserId)
			await inventoryService.deleteType(type.id, testUserId)

			const [deleted] = await db.select().from(inventoryType).where(eq(inventoryType.id, type.id)).limit(1)

			expect(deleted).toBeUndefined()
		})
	})

	describe('deleteShop', () => {
		it('should delete inventory shop', async () => {
			const shop = await inventoryService.createShop(inventoryShopItem('deleteShop1'), testUserId)
			await inventoryService.deleteShop(shop.id, testUserId)

			const [deleted] = await db.select().from(inventoryShop).where(eq(inventoryShop.id, shop.id)).limit(1)

			expect(deleted).toBeUndefined()
		})
	})

	describe('deletePackage', () => {
		it('should delete inventory package', async () => {
			const pkg = await inventoryService.createPackage(inventoryPackageItem('deletePackage1'), testUserId)
			await inventoryService.deletePackage(pkg.id, testUserId)

			const [deleted] = await db.select().from(inventoryPackage).where(eq(inventoryPackage.id, pkg.id)).limit(1)

			expect(deleted).toBeUndefined()
		})
	})

	describe('deleteSurfaceMount', () => {
		it('should delete inventory surface mount', async () => {
			const sm = await inventoryService.createSurfaceMount(inventorySurfaceMountItem('deleteSM1'), testUserId)
			await inventoryService.deleteSurfaceMount(sm.id, testUserId)

			const [deleted] = await db
				.select()
				.from(inventorySurfaceMount)
				.where(eq(inventorySurfaceMount.id, sm.id))
				.limit(1)

			expect(deleted).toBeUndefined()
		})
	})

	describe('search', () => {
		it('should find items by name', async () => {
			await inventoryService.create(uniqueItem('search1'), testUserId)

			const result = await inventoryService.getAll(1, 20, {
				name: 'Test Resistor search1',
			})

			expect(result.data.length).toBeGreaterThan(0)
			expect(result.data[0].name).toBe('Test Resistor search1')
		})

		it('should return empty for non-existent name', async () => {
			const result = await inventoryService.getAll(1, 20, {
				name: 'NonExistentComponent12345',
			})

			expect(result.data.length).toBe(0)
			expect(result.pagination.total).toBe(0)
		})
	})

	describe('removeInventoryUser', () => {
		it('should remove user and related sessions', async () => {
			await db
				.delete(sessions)
				.where(eq(sessions.userId, testUserId))
				.catch(() => {})
		})
		it('should remove all audit logs for the user', async () => {
			await db
				.delete(auditLog)
				.where(eq(auditLog.userId, testUserId))
				.catch(() => {})
		})
		it('should remove user', async () => {
			await db
				.delete(users)
				.where(eq(users.id, testUserId))
				.catch(() => {})
		})
	})
})
