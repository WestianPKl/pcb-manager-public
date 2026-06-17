import { and, ilike, eq, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '../../db/index.js'
import {
	inventory,
	inventoryType,
	inventoryPackage,
	inventorySurfaceMount,
	inventoryShop,
	inventoryStock,
	inventoryStockMovement,
} from '../../db/schema/index.js'
import { users } from '../../db/schema/users.js'
import type {
	CreateInventoryInput,
	UpdateInventoryInput,
	DictionaryInput,
	SearchInventoryInput,
} from './inventory.schema.js'
import { audit } from '../../utils/audit.js'

const createdByUser = alias(users, 'created_by_user')
const updatedByUser = alias(users, 'updated_by_user')

export const inventoryService = {
	async getTypes() {
		return db.select().from(inventoryType).orderBy(inventoryType.name)
	},

	async createType(input: DictionaryInput, userId: string) {
		const [type] = await db.insert(inventoryType).values({ name: input.name }).returning()

		await audit({
			userId,
			action: 'CREATE',
			table: 'inventory_type',
			recordId: type.id,
			newValue: type,
		})

		return type
	},

	async updateType(id: string, input: DictionaryInput, userId: string) {
		const [type] = await db.update(inventoryType).set({ name: input.name }).where(eq(inventoryType.id, id)).returning()
		await audit({
			userId,
			action: 'UPDATE',
			table: 'inventory_type',
			recordId: type.id,
			newValue: type,
		})
		return type ?? null
	},

	async deleteType(id: string, userId: string) {
		await db.delete(inventoryType).where(eq(inventoryType.id, id))
		await audit({
			userId,
			action: 'DELETE',
			table: 'inventory_type',
			recordId: id,
		})
	},

	async getPackages() {
		return db.select().from(inventoryPackage).orderBy(inventoryPackage.name)
	},

	async createPackage(input: DictionaryInput, userId: string) {
		const [pkg] = await db.insert(inventoryPackage).values({ name: input.name }).returning()
		await audit({
			userId,
			action: 'CREATE',
			table: 'inventory_package',
			recordId: pkg.id,
			newValue: pkg,
		})
		return pkg
	},

	async updatePackage(id: string, input: DictionaryInput, userId: string) {
		const [pkg] = await db
			.update(inventoryPackage)
			.set({ name: input.name })
			.where(eq(inventoryPackage.id, id))
			.returning()
		await audit({
			userId,
			action: 'UPDATE',
			table: 'inventory_package',
			recordId: pkg.id,
			newValue: pkg,
		})
		return pkg ?? null
	},

	async deletePackage(id: string, userId: string) {
		await db.delete(inventoryPackage).where(eq(inventoryPackage.id, id))
		await audit({
			userId,
			action: 'DELETE',
			table: 'inventory_package',
			recordId: id,
		})
	},

	async getSurfaceMounts() {
		return db.select().from(inventorySurfaceMount).orderBy(inventorySurfaceMount.name)
	},

	async createSurfaceMount(input: DictionaryInput, userId: string) {
		const [sm] = await db.insert(inventorySurfaceMount).values({ name: input.name }).returning()
		await audit({
			userId,
			action: 'CREATE',
			table: 'inventory_surface_mount',
			recordId: sm.id,
			newValue: sm,
		})
		return sm
	},

	async updateSurfaceMount(id: string, input: DictionaryInput, userId: string) {
		const [sm] = await db
			.update(inventorySurfaceMount)
			.set({ name: input.name })
			.where(eq(inventorySurfaceMount.id, id))
			.returning()
		await audit({
			userId,
			action: 'UPDATE',
			table: 'inventory_surface_mount',
			recordId: sm.id,
			newValue: sm,
		})
		return sm ?? null
	},

	async deleteSurfaceMount(id: string, userId: string) {
		await db.delete(inventorySurfaceMount).where(eq(inventorySurfaceMount.id, id))
		await audit({
			userId,
			action: 'DELETE',
			table: 'inventory_surface_mount',
			recordId: id,
		})
	},

	async getShops() {
		return db.select().from(inventoryShop).orderBy(inventoryShop.name)
	},

	async createShop(input: DictionaryInput, userId: string) {
		const [shop] = await db.insert(inventoryShop).values({ name: input.name }).returning()
		await audit({
			userId,
			action: 'CREATE',
			table: 'inventory_shop',
			recordId: shop.id,
			newValue: shop,
		})
		return shop
	},

	async updateShop(id: string, input: DictionaryInput, userId: string) {
		const [shop] = await db.update(inventoryShop).set({ name: input.name }).where(eq(inventoryShop.id, id)).returning()
		await audit({
			userId,
			action: 'UPDATE',
			table: 'inventory_shop',
			recordId: shop.id,
			newValue: shop,
		})
		return shop ?? null
	},

	async deleteShop(id: string, userId: string) {
		await db.delete(inventoryShop).where(eq(inventoryShop.id, id))
		await audit({
			userId,
			action: 'DELETE',
			table: 'inventory_shop',
			recordId: id,
		})
	},

	async getAll(page = 1, limit = 20, filters: Omit<SearchInventoryInput, 'page' | 'limit'> = {}) {
		const offset = (page - 1) * limit

		const conditions = []
		if (filters.name) conditions.push(ilike(inventory.name, `%${filters.name}%`))
		if (filters.manufacturerNumber)
			conditions.push(ilike(inventory.manufacturerNumber, `%${filters.manufacturerNumber}%`))
		if (filters.parameters) {
			for (const [key, value] of Object.entries(filters.parameters)) {
				conditions.push(sql`${inventory.parameters}->>${key} ilike ${'%' + value + '%'}`)
			}
		}
		if (filters.lowThreshold !== undefined) conditions.push(eq(inventory.lowThreshold, filters.lowThreshold))
		if (filters.inventoryTypeId) conditions.push(eq(inventory.inventoryTypeId, filters.inventoryTypeId))
		if (filters.inventoryPackageId) conditions.push(eq(inventory.inventoryPackageId, filters.inventoryPackageId))
		if (filters.inventorySurfaceMountId)
			conditions.push(eq(inventory.inventorySurfaceMountId, filters.inventorySurfaceMountId))
		if (filters.inventoryShopId) conditions.push(eq(inventory.inventoryShopId, filters.inventoryShopId))

		const where = conditions.length > 0 ? and(...conditions) : undefined

		const [data, countResult] = await Promise.all([
			db
				.select({
					id: inventory.id,
					name: inventory.name,
					manufacturerNumber: inventory.manufacturerNumber,
					parameters: inventory.parameters,
					comment: inventory.comment,
					lowThreshold: inventory.lowThreshold,
					inventoryTypeId: inventory.inventoryTypeId,
					inventorySurfaceMountId: inventory.inventorySurfaceMountId,
					inventoryPackageId: inventory.inventoryPackageId,
					inventoryShopId: inventory.inventoryShopId,
					createdAt: inventory.createdAt,
					updatedAt: inventory.updatedAt,
					createdById: inventory.createdById,
					updatedById: inventory.updatedById,
					quantity: inventoryStock.quantity,
					inventoryTypeName: inventoryType.name,
					inventoryPackageName: inventoryPackage.name,
					inventorySurfaceMountName: inventorySurfaceMount.name,
					inventoryShopName: inventoryShop.name,
					createdBy: createdByUser.name,
					updatedBy: updatedByUser.name,
				})
				.from(inventory)
				.leftJoin(inventoryStock, eq(inventoryStock.inventoryId, inventory.id))
				.leftJoin(inventoryType, eq(inventoryType.id, inventory.inventoryTypeId))
				.leftJoin(inventoryPackage, eq(inventoryPackage.id, inventory.inventoryPackageId))
				.leftJoin(inventorySurfaceMount, eq(inventorySurfaceMount.id, inventory.inventorySurfaceMountId))
				.leftJoin(inventoryShop, eq(inventoryShop.id, inventory.inventoryShopId))
				.leftJoin(createdByUser, eq(createdByUser.id, inventory.createdById))
				.leftJoin(updatedByUser, eq(updatedByUser.id, inventory.updatedById))
				.where(where)
				.orderBy(inventory.name)
				.limit(limit)
				.offset(offset),

			db.select({ count: sql<number>`cast(count(*) as integer)` }).from(inventory).where(where),
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
			.select({
				id: inventory.id,
				name: inventory.name,
				manufacturerNumber: inventory.manufacturerNumber,
				parameters: inventory.parameters,
				comment: inventory.comment,
				lowThreshold: inventory.lowThreshold,
				inventoryTypeId: inventory.inventoryTypeId,
				inventorySurfaceMountId: inventory.inventorySurfaceMountId,
				inventoryPackageId: inventory.inventoryPackageId,
				inventoryShopId: inventory.inventoryShopId,
				createdAt: inventory.createdAt,
				updatedAt: inventory.updatedAt,
				createdById: inventory.createdById,
				updatedById: inventory.updatedById,
				quantity: inventoryStock.quantity,
				inventoryTypeName: inventoryType.name,
				inventoryPackageName: inventoryPackage.name,
				inventorySurfaceMountName: inventorySurfaceMount.name,
				inventoryShopName: inventoryShop.name,
				createdBy: createdByUser.name,
				updatedBy: updatedByUser.name,
			})
			.from(inventory)
			.leftJoin(inventoryStock, eq(inventoryStock.inventoryId, inventory.id))
			.leftJoin(inventoryType, eq(inventoryType.id, inventory.inventoryTypeId))
			.leftJoin(inventoryPackage, eq(inventoryPackage.id, inventory.inventoryPackageId))
			.leftJoin(inventorySurfaceMount, eq(inventorySurfaceMount.id, inventory.inventorySurfaceMountId))
			.leftJoin(inventoryShop, eq(inventoryShop.id, inventory.inventoryShopId))
			.leftJoin(createdByUser, eq(createdByUser.id, inventory.createdById))
			.leftJoin(updatedByUser, eq(updatedByUser.id, inventory.updatedById))
			.where(eq(inventory.id, id))
			.limit(1)

		return item ?? null
	},

	async create(input: CreateInventoryInput, userId: string) {
		const [item] = await db
			.insert(inventory)
			.values({
				...input,
				createdById: userId,
				updatedById: userId,
			})
			.returning()

		await db.insert(inventoryStock).values({
			inventoryId: item.id,
			quantity: 0,
			updatedById: userId,
		})

		await audit({
			userId,
			action: 'CREATE',
			table: 'inventory',
			recordId: item.id,
			newValue: item,
		})

		return item
	},

	async update(id: string, input: UpdateInventoryInput, userId: string) {
		const [item] = await db
			.update(inventory)
			.set({
				...input,
				updatedById: userId,
				updatedAt: new Date(),
			})
			.where(eq(inventory.id, id))
			.returning()

		if (item) {
			await audit({
				userId,
				action: 'UPDATE',
				table: 'inventory',
				recordId: item.id,
				newValue: item,
			})
		}

		return item ?? null
	},

	async delete(id: string, userId: string) {
		const [old] = await db.select().from(inventory).where(eq(inventory.id, id)).limit(1)

		await db.transaction(async tx => {
			await tx.delete(inventoryStock).where(eq(inventoryStock.inventoryId, id))
			await tx.delete(inventoryStockMovement).where(eq(inventoryStockMovement.inventoryId, id))
			await tx.delete(inventory).where(eq(inventory.id, id))
		})

		await audit({
			userId,
			action: 'DELETE',
			table: 'inventory',
			recordId: id,
			oldValue: old,
		})
	},
}
