import {
	pgTable,
	uuid,
	varchar,
	integer,
	timestamp,
	index,
	foreignKey,
	boolean,
	unique,
	text,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { inventory } from './inventory'

export const projects = pgTable(
	'projects',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: varchar('name', { length: 255 }).notNull().unique(),
		description: text('description'),
		createdById: uuid('created_by_id'),
		updatedById: uuid('updated_by_id'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
	},
	table => ({
		createdByFk: foreignKey({
			name: 'projects_created_by_fk',
			columns: [table.createdById],
			foreignColumns: [users.id],
		}),
		updatedByFk: foreignKey({
			name: 'projects_updated_by_fk',
			columns: [table.updatedById],
			foreignColumns: [users.id],
		}),
	}),
)

export const pcb = pgTable(
	'pcb',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		projectId: uuid('project_id').notNull(),
		name: varchar('name', { length: 255 }).notNull(),
		revision: varchar('revision', { length: 45 }).notNull(),
		topUrl: varchar('top_url', { length: 255 }),
		bottomUrl: varchar('bottom_url', { length: 255 }),
		comment: varchar('comment', { length: 255 }),
		verified: boolean('verified').default(false),
		createdById: uuid('created_by_id'),
		updatedById: uuid('updated_by_id'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
	},
	table => ({
		uniquePcb: unique('unique_pcb').on(table.name, table.revision),
		projectIdx: index('pcb_project_idx').on(table.projectId),
		createdByIdx: index('pcb_created_by_idx').on(table.createdById),
		updatedByIdx: index('pcb_updated_by_idx').on(table.updatedById),
		projectFk: foreignKey({
			name: 'pcb_project_fk',
			columns: [table.projectId],
			foreignColumns: [projects.id],
		}),
		createdByFk: foreignKey({
			name: 'pcb_created_by_fk',
			columns: [table.createdById],
			foreignColumns: [users.id],
		}),
		updatedByFk: foreignKey({
			name: 'pcb_updated_by_fk',
			columns: [table.updatedById],
			foreignColumns: [users.id],
		}),
	}),
)

export const pcbBomItems = pgTable(
	'pcb_bom_items',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		pcbId: uuid('pcb_id').notNull(),
		inventoryId: uuid('inventory_id').notNull(),
		qtyPerBoard: integer('qty_per_board').notNull(),
		designators: varchar('designators', { length: 255 }),
		valueSpec: varchar('value_spec', { length: 255 }),
		allowSubstitute: boolean('allow_substitute').default(false),
		comment: varchar('comment', { length: 255 }),
		createdById: uuid('created_by_id'),
		updatedById: uuid('updated_by_id'),
	},
	table => ({
		uniqueBomItem: unique('unique_pcb_bom_item').on(table.pcbId, table.inventoryId),
		pcbIdx: index('bom_pcb_idx').on(table.pcbId),
		inventoryIdx: index('bom_inventory_idx').on(table.inventoryId),
		pcbFk: foreignKey({
			name: 'bom_pcb_fk',
			columns: [table.pcbId],
			foreignColumns: [pcb.id],
		}),
		inventoryFk: foreignKey({
			name: 'bom_inventory_fk',
			columns: [table.inventoryId],
			foreignColumns: [inventory.id],
		}),
		createdByFk: foreignKey({
			name: 'bom_created_by_fk',
			columns: [table.createdById],
			foreignColumns: [users.id],
		}),
		updatedByFk: foreignKey({
			name: 'bom_updated_by_fk',
			columns: [table.updatedById],
			foreignColumns: [users.id],
		}),
	}),
)

export const devices = pgTable(
	'devices',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: varchar('name', { length: 255 }).notNull(),
		serialNumber: varchar('serial_number', { length: 255 }).notNull().unique(),
		claimToken: varchar('claim_token', { length: 255 }).unique(),
		claimedAt: timestamp('claimed_at', { withTimezone: true }),
		description: varchar('description', { length: 255 }),
		pcbId: uuid('pcb_id').notNull(),
		createdById: uuid('created_by_id').notNull(),
		updatedById: uuid('updated_by_id').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
	},
	table => ({
		pcbIdx: index('devices_pcb_idx').on(table.pcbId),
		pcbFk: foreignKey({
			name: 'devices_pcb_fk',
			columns: [table.pcbId],
			foreignColumns: [pcb.id],
		}),
		createdByFk: foreignKey({
			name: 'devices_created_by_fk',
			columns: [table.createdById],
			foreignColumns: [users.id],
		}),
		updatedByFk: foreignKey({
			name: 'devices_updated_by_fk',
			columns: [table.updatedById],
			foreignColumns: [users.id],
		}),
	}),
)

export const productionOrders = pgTable(
	'production_orders',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		pcbId: uuid('pcb_id').notNull(),
		quantity: integer('quantity').notNull(),
		status: varchar('status', { length: 50 }).notNull().default('planned'),
		createdById: uuid('created_by_id'),
		updatedById: uuid('updated_by_id'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
	},
	table => ({
		pcbIdx: index('production_orders_pcb_idx').on(table.pcbId),
		pcbFk: foreignKey({
			name: 'production_orders_pcb_fk',
			columns: [table.pcbId],
			foreignColumns: [pcb.id],
		}),
		createdByFk: foreignKey({
			name: 'production_orders_created_by_fk',
			columns: [table.createdById],
			foreignColumns: [users.id],
		}),
		updatedByFk: foreignKey({
			name: 'production_orders_updated_by_fk',
			columns: [table.updatedById],
			foreignColumns: [users.id],
		}),
	}),
)

export const productionOrderItems = pgTable(
	'production_order_items',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		productionOrderId: uuid('production_order_id').notNull(),
		inventoryId: uuid('inventory_id').notNull(),
		qtyPerBoard: integer('qty_per_board').notNull(),
		requiredQtyTotal: integer('required_qty_total').notNull(),
		consumedQty: integer('consumed_qty').default(0),
		allowSubstitute: boolean('allow_substitute').default(false),
		designators: varchar('designators', { length: 255 }),
		status: varchar('status', { length: 20 }).notNull().default('ok'),
		createdById: uuid('created_by_id'),
		updatedById: uuid('updated_by_id'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
	},
	table => ({
		uniqueOrderItem: unique('unique_production_order_item').on(table.productionOrderId, table.inventoryId),
		orderIdx: index('order_items_order_idx').on(table.productionOrderId),
		inventoryIdx: index('order_items_inventory_idx').on(table.inventoryId),
		orderFk: foreignKey({
			name: 'order_items_order_fk',
			columns: [table.productionOrderId],
			foreignColumns: [productionOrders.id],
		}),
		inventoryFk: foreignKey({
			name: 'order_items_inventory_fk',
			columns: [table.inventoryId],
			foreignColumns: [inventory.id],
		}),
		createdByFk: foreignKey({
			name: 'order_items_created_by_fk',
			columns: [table.createdById],
			foreignColumns: [users.id],
		}),
		updatedByFk: foreignKey({
			name: 'order_items_updated_by_fk',
			columns: [table.updatedById],
			foreignColumns: [users.id],
		}),
	}),
)
