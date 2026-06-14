import { pgTable, uuid, varchar, integer, timestamp, index, foreignKey, jsonb, unique } from 'drizzle-orm/pg-core'
import { users } from './users'

export const inventoryType = pgTable('inventory_type', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 45 }).notNull().unique(),
})

export const inventoryPackage = pgTable('inventory_package', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 45 }).notNull().unique(),
})

export const inventorySurfaceMount = pgTable('inventory_surface_mount', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 45 }).notNull().unique(),
})

export const inventoryShop = pgTable('inventory_shop', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 45 }).notNull().unique(),
})

export const inventory = pgTable(
	'inventory',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: varchar('name', { length: 45 }),
		manufacturerNumber: varchar('manufacturer_number', { length: 200 }),
		parameters: jsonb('parameters'),
		comment: varchar('comment', { length: 255 }),
		lowThreshold: integer('low_threshold').default(0),
		inventoryTypeId: uuid('inventory_type_id'),
		inventorySurfaceMountId: uuid('inventory_surface_mount_id'),
		inventoryPackageId: uuid('inventory_package_id'),
		inventoryShopId: uuid('inventory_shop_id'),
		createdById: uuid('created_by_id'),
		updatedById: uuid('updated_by_id'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
	},
	table => ({
		uniqueInventory: unique('unique_inventory').on(table.name, table.manufacturerNumber),
		typeIdx: index('inventory_type_idx').on(table.inventoryTypeId),
		packageIdx: index('inventory_package_idx').on(table.inventoryPackageId),
		surfaceIdx: index('inventory_surface_mount_idx').on(table.inventorySurfaceMountId),
		shopIdx: index('inventory_shop_idx').on(table.inventoryShopId),
		createdByIdx: index('inventory_created_by_idx').on(table.createdById),
		updatedByIdx: index('inventory_updated_by_idx').on(table.updatedById),

		typeFk: foreignKey({
			name: 'inventory_type_fk',
			columns: [table.inventoryTypeId],
			foreignColumns: [inventoryType.id],
		}),
		packageFk: foreignKey({
			name: 'inventory_package_fk',
			columns: [table.inventoryPackageId],
			foreignColumns: [inventoryPackage.id],
		}),
		surfaceFk: foreignKey({
			name: 'inventory_surface_mount_fk',
			columns: [table.inventorySurfaceMountId],
			foreignColumns: [inventorySurfaceMount.id],
		}),
		shopFk: foreignKey({
			name: 'inventory_shop_fk',
			columns: [table.inventoryShopId],
			foreignColumns: [inventoryShop.id],
		}),
		createdByFk: foreignKey({
			name: 'inventory_created_by_fk',
			columns: [table.createdById],
			foreignColumns: [users.id],
		}),
		updatedByFk: foreignKey({
			name: 'inventory_updated_by_fk',
			columns: [table.updatedById],
			foreignColumns: [users.id],
		}),
	}),
)

export const inventoryStock = pgTable(
	'inventory_stock',
	{
		inventoryId: uuid('inventory_id').primaryKey(),
		quantity: integer('quantity').notNull(),
		updatedById: uuid('updated_by_id'),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
	},
	table => ({
		inventoryFk: foreignKey({
			name: 'inventory_stock_inventory_fk',
			columns: [table.inventoryId],
			foreignColumns: [inventory.id],
		}),
		updatedByFk: foreignKey({
			name: 'inventory_stock_updated_by_fk',
			columns: [table.updatedById],
			foreignColumns: [users.id],
		}),
	}),
)

export const inventoryStockMovement = pgTable(
	'inventory_stock_movement',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		inventoryId: uuid('inventory_id').notNull(),
		delta: integer('delta').notNull(),
		reason: varchar('reason', { length: 50 }).notNull(),
		note: varchar('note', { length: 255 }),
		createdById: uuid('created_by_id'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	},
	table => ({
		inventoryIdx: index('stock_movement_inventory_idx').on(table.inventoryId),
		createdByIdx: index('stock_movement_created_by_idx').on(table.createdById),
		inventoryFk: foreignKey({
			name: 'stock_movement_inventory_fk',
			columns: [table.inventoryId],
			foreignColumns: [inventory.id],
		}),
		createdByFk: foreignKey({
			name: 'stock_movement_created_by_fk',
			columns: [table.createdById],
			foreignColumns: [users.id],
		}),
	}),
)
