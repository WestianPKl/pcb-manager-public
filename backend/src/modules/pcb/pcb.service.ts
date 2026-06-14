import { eq, ilike, and, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '../../db/index.js'
import { pcb, pcbBomItems, projects, inventory } from '../../db/schema/index.js'
import { users } from '../../db/schema/users.js'
import type {
	CreatePcbInput,
	UpdatePcbInput,
	SearchPcbInput,
	CreateBomItemInput,
	UpdateBomItemInput,
} from './pcb.schema.js'
import { audit } from '../../utils/audit.js'

const createdByUser = alias(users, 'created_by_user')
const updatedByUser = alias(users, 'updated_by_user')

export const pcbService = {
	async getAll(page = 1, limit = 20) {
		const offset = (page - 1) * limit

		const [data, countResult] = await Promise.all([
			db
				.select({
					id: pcb.id,
					projectId: pcb.projectId,
					projectName: projects.name,
					name: pcb.name,
					revision: pcb.revision,
					topUrl: pcb.topUrl,
					bottomUrl: pcb.bottomUrl,
					comment: pcb.comment,
					verified: pcb.verified,
					createdAt: pcb.createdAt,
					updatedAt: pcb.updatedAt,
					createdById: pcb.createdById,
					updatedById: pcb.updatedById,
					createdBy: createdByUser.name,
					updatedBy: updatedByUser.name,
				})
				.from(pcb)
				.leftJoin(projects, eq(projects.id, pcb.projectId))
				.leftJoin(createdByUser, eq(createdByUser.id, pcb.createdById))
				.leftJoin(updatedByUser, eq(updatedByUser.id, pcb.updatedById))
				.orderBy(pcb.name)
				.limit(limit)
				.offset(offset),

			db.select({ count: sql<number>`cast(count(*) as integer)` }).from(pcb),
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

	async search(input: SearchPcbInput) {
		const conditions = []
		const offset = (input.page - 1) * input.limit

		if (input.name) conditions.push(ilike(pcb.name, `%${input.name}%`))
		if (input.projectId) conditions.push(eq(pcb.projectId, input.projectId))
		if (input.verified !== undefined) conditions.push(eq(pcb.verified, input.verified))

		const where = conditions.length > 0 ? and(...conditions) : undefined

		const [data, countResult] = await Promise.all([
			db
				.select({
					id: pcb.id,
					projectId: pcb.projectId,
					projectName: projects.name,
					name: pcb.name,
					revision: pcb.revision,
					topUrl: pcb.topUrl,
					bottomUrl: pcb.bottomUrl,
					comment: pcb.comment,
					verified: pcb.verified,
					createdAt: pcb.createdAt,
					updatedAt: pcb.updatedAt,
					createdById: pcb.createdById,
					updatedById: pcb.updatedById,
					createdBy: createdByUser.name,
					updatedBy: updatedByUser.name,
				})
				.from(pcb)
				.leftJoin(projects, eq(projects.id, pcb.projectId))
				.leftJoin(createdByUser, eq(createdByUser.id, pcb.createdById))
				.leftJoin(updatedByUser, eq(updatedByUser.id, pcb.updatedById))
				.where(where)
				.orderBy(pcb.name)
				.limit(input.limit)
				.offset(offset),

			db
				.select({ count: sql<number>`cast(count(*) as integer)` })
				.from(pcb)
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

	async getById(id: string) {
		const [item] = await db
			.select({
				id: pcb.id,
				projectId: pcb.projectId,
				projectName: projects.name,
				name: pcb.name,
				revision: pcb.revision,
				topUrl: pcb.topUrl,
				bottomUrl: pcb.bottomUrl,
				comment: pcb.comment,
				verified: pcb.verified,
				createdAt: pcb.createdAt,
				updatedAt: pcb.updatedAt,
				createdById: pcb.createdById,
				updatedById: pcb.updatedById,
				createdBy: createdByUser.name,
				updatedBy: updatedByUser.name,
			})
			.from(pcb)
			.leftJoin(projects, eq(projects.id, pcb.projectId))
			.leftJoin(createdByUser, eq(createdByUser.id, pcb.createdById))
			.leftJoin(updatedByUser, eq(updatedByUser.id, pcb.updatedById))
			.where(eq(pcb.id, id))
			.limit(1)

		return item ?? null
	},

	async create(input: CreatePcbInput, userId: string) {
		const [item] = await db
			.insert(pcb)
			.values({
				...input,
				createdById: userId,
				updatedById: userId,
			})
			.returning()

		await audit({
			userId,
			action: 'CREATE',
			table: 'pcb',
			recordId: item.id,
			newValue: item,
		})

		return item
	},

	async update(id: string, input: UpdatePcbInput, userId: string) {
		const [item] = await db
			.update(pcb)
			.set({ ...input, updatedById: userId, updatedAt: new Date() })
			.where(eq(pcb.id, id))
			.returning()

		await audit({
			userId,
			action: 'UPDATE',
			table: 'pcb',
			recordId: item.id,
			newValue: item,
		})

		return item ?? null
	},

	async delete(id: string, userId: string) {
		await db.transaction(async tx => {
			await tx.delete(pcbBomItems).where(eq(pcbBomItems.pcbId, id))
			await tx.delete(pcb).where(eq(pcb.id, id))
		})

		await audit({
			userId,
			action: 'DELETE',
			table: 'pcb',
			recordId: id,
		})
	},

	async getBom(pcbId: string) {
		return db
			.select({
				id: pcbBomItems.id,
				pcbId: pcbBomItems.pcbId,
				inventoryId: pcbBomItems.inventoryId,
				inventoryName: inventory.name,
				qtyPerBoard: pcbBomItems.qtyPerBoard,
				designators: pcbBomItems.designators,
				valueSpec: pcbBomItems.valueSpec,
				allowSubstitute: pcbBomItems.allowSubstitute,
				comment: pcbBomItems.comment,
			})
			.from(pcbBomItems)
			.leftJoin(inventory, eq(inventory.id, pcbBomItems.inventoryId))
			.where(eq(pcbBomItems.pcbId, pcbId))
			.orderBy(inventory.name)
	},

	async addBomItem(pcbId: string, input: CreateBomItemInput, userId: string) {
		const [item] = await db
			.insert(pcbBomItems)
			.values({
				pcbId,
				...input,
				createdById: userId,
				updatedById: userId,
			})
			.returning()

		await audit({
			userId,
			action: 'CREATE',
			table: 'pcb_bom_items',
			recordId: item.id,
			newValue: item,
		})

		return item
	},

	async updateBomItem(id: string, input: UpdateBomItemInput, userId: string) {
		const [item] = await db
			.update(pcbBomItems)
			.set({ ...input, updatedById: userId })
			.where(eq(pcbBomItems.id, id))
			.returning()

		await audit({
			userId,
			action: 'UPDATE',
			table: 'pcb_bom_items',
			recordId: item.id,
			newValue: item,
		})

		return item ?? null
	},

	async deleteBomItem(id: string, userId: string) {
		await db.delete(pcbBomItems).where(eq(pcbBomItems.id, id))

		await audit({
			userId,
			action: 'DELETE',
			table: 'pcb_bom_items',
			recordId: id,
		})
	},
}
