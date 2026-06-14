import { db } from '../../db/index.js'
import { inventory, inventoryStock, pcb, devices, productionOrders } from '../../db/schema/index.js'
import { lt, eq, desc, sql } from 'drizzle-orm'

export const dashboardService = {
	async getStats() {
		const [inventoryCount, pcbCount, deviceCount, productionCount] = await Promise.all([
			db.select({ count: sql<number>`cast(count(*) as integer)` }).from(inventory),
			db.select({ count: sql<number>`cast(count(*) as integer)` }).from(pcb),
			db.select({ count: sql<number>`cast(count(*) as integer)` }).from(devices),
			db.select({ count: sql<number>`cast(count(*) as integer)` }).from(productionOrders),
		])

		return {
			inventory: inventoryCount[0].count,
			pcb: pcbCount[0].count,
			devices: deviceCount[0].count,
			production: productionCount[0].count,
		}
	},

	async getLowStock() {
		return db
			.select({
				id: inventory.id,
				name: inventory.name,
				quantity: inventoryStock.quantity,
				lowThreshold: inventory.lowThreshold,
			})
			.from(inventory)
			.leftJoin(inventoryStock, eq(inventoryStock.inventoryId, inventory.id))
			.where(lt(inventoryStock.quantity, inventory.lowThreshold))
			.orderBy(inventoryStock.quantity)
			.limit(10)
	},

	async getRecentInventory() {
		return db
			.select({
				id: inventory.id,
				name: inventory.name,
				quantity: inventoryStock.quantity,
				createdAt: inventory.createdAt,
			})
			.from(inventory)
			.leftJoin(inventoryStock, eq(inventoryStock.inventoryId, inventory.id))
			.orderBy(desc(inventory.createdAt))
			.limit(5)
	},

	async getRecentProduction() {
		return db
			.select({
				id: productionOrders.id,
				pcbName: pcb.name,
				revision: pcb.revision,
				quantity: productionOrders.quantity,
				status: productionOrders.status,
				createdAt: productionOrders.createdAt,
			})
			.from(productionOrders)
			.leftJoin(pcb, eq(pcb.id, productionOrders.pcbId))
			.orderBy(desc(productionOrders.createdAt))
			.limit(5)
	},

	async getProductionHistory() {
		return db.execute(sql`
      SELECT
        to_char(date_trunc('month', created_at), 'Mon YY') as month,
        cast(count(*) as integer) as total,
        cast(sum(case when status = 'produced' then 1 else 0 end) as integer) as produced,
        cast(sum(case when status = 'cancelled' then 1 else 0 end) as integer) as cancelled
      FROM production_orders
      WHERE created_at > now() - interval '6 months'
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at)
    `)
	},
}
