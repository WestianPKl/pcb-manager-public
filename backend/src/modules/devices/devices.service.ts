import { eq, ilike, and, isNull, isNotNull, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '../../db/index.js'
import { devices, pcb } from '../../db/schema/index.js'
import { users } from '../../db/schema/users.js'
import crypto from 'crypto'
import type { CreateDeviceInput, UpdateDeviceInput, SearchDeviceInput } from './devices.schema.js'
import { audit } from '../../utils/audit.js'

const createdByUser = alias(users, 'created_by_user')
const updatedByUser = alias(users, 'updated_by_user')

function generateSerialNumber(): string {
	const date = new Date()
	const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
	const random = crypto.randomBytes(3).toString('hex').toUpperCase()
	return `PCB-${dateStr}-${random}`
}

function generateClaimToken(): string {
	return crypto.randomUUID()
}

const deviceSelect = {
	id: devices.id,
	name: devices.name,
	serialNumber: devices.serialNumber,
	claimToken: devices.claimToken,
	claimedAt: devices.claimedAt,
	description: devices.description,
	pcbId: devices.pcbId,
	pcbName: pcb.name,
	pcbRevision: pcb.revision,
	createdAt: devices.createdAt,
	updatedAt: devices.updatedAt,
	createdById: devices.createdById,
	updatedById: devices.updatedById,
	createdBy: createdByUser.name,
	updatedBy: updatedByUser.name,
}

export const devicesService = {
	async getAll(page = 1, limit = 20, filters: Omit<SearchDeviceInput, 'page' | 'limit'> = {}) {
		const offset = (page - 1) * limit

		const conditions = []
		if (filters.name) conditions.push(ilike(devices.name, `%${filters.name}%`))
		if (filters.pcbId) conditions.push(eq(devices.pcbId, filters.pcbId))
		if (filters.serialNumber) conditions.push(ilike(devices.serialNumber, `%${filters.serialNumber}%`))
		if (filters.claimed === true) conditions.push(isNotNull(devices.claimedAt))
		if (filters.claimed === false) conditions.push(isNull(devices.claimedAt))

		const where = conditions.length > 0 ? and(...conditions) : undefined

		const [data, countResult] = await Promise.all([
			db
				.select(deviceSelect)
				.from(devices)
				.leftJoin(pcb, eq(pcb.id, devices.pcbId))
				.leftJoin(createdByUser, eq(createdByUser.id, devices.createdById))
				.leftJoin(updatedByUser, eq(updatedByUser.id, devices.updatedById))
				.where(where)
				.orderBy(devices.createdAt)
				.limit(limit)
				.offset(offset),

			db.select({ count: sql<number>`cast(count(*) as integer)` }).from(devices).where(where),
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
			.select(deviceSelect)
			.from(devices)
			.leftJoin(pcb, eq(pcb.id, devices.pcbId))
			.leftJoin(createdByUser, eq(createdByUser.id, devices.createdById))
			.leftJoin(updatedByUser, eq(updatedByUser.id, devices.updatedById))
			.where(eq(devices.id, id))
			.limit(1)

		return item ?? null
	},

	async getBySerialNumber(serialNumber: string) {
		const [item] = await db
			.select(deviceSelect)
			.from(devices)
			.leftJoin(pcb, eq(pcb.id, devices.pcbId))
			.leftJoin(createdByUser, eq(createdByUser.id, devices.createdById))
			.leftJoin(updatedByUser, eq(updatedByUser.id, devices.updatedById))
			.where(eq(devices.serialNumber, serialNumber))
			.limit(1)

		return item ?? null
	},

	async create(input: CreateDeviceInput, userId: string) {
		const [item] = await db
			.insert(devices)
			.values({
				...input,
				serialNumber: generateSerialNumber(),
				claimToken: generateClaimToken(),
				createdById: userId,
				updatedById: userId,
			})
			.returning()

		await audit({
			userId,
			action: 'CREATE',
			table: 'devices',
			recordId: item.id,
			newValue: item,
		})

		return item
	},

	async update(id: string, input: UpdateDeviceInput, userId: string) {
		const [item] = await db
			.update(devices)
			.set({ ...input, updatedById: userId, updatedAt: new Date() })
			.where(eq(devices.id, id))
			.returning()

		if (!item) return null

		await audit({
			userId,
			action: 'UPDATE',
			table: 'devices',
			recordId: item.id,
			newValue: item,
		})

		return item
	},

	async claim(claimToken: string, userId: string) {
		const [item] = await db
			.update(devices)
			.set({ claimedAt: new Date() })
			.where(eq(devices.claimToken, claimToken))
			.returning()

		await audit({
			userId,
			action: 'UPDATE',
			table: 'devices_claim',
			recordId: item.id,
			newValue: item,
		})

		return item ?? null
	},

	async regenerateClaimToken(id: string, userId: string) {
		const [item] = await db
			.update(devices)
			.set({
				claimToken: generateClaimToken(),
				claimedAt: null,
			})
			.where(eq(devices.id, id))
			.returning()

		await audit({
			userId,
			action: 'UPDATE',
			table: 'devices_regenerate_claim_token',
			recordId: item.id,
			newValue: item,
		})

		return item ?? null
	},

	async delete(id: string, userId: string) {
		await db.delete(devices).where(eq(devices.id, id))
		await audit({
			userId,
			action: 'DELETE',
			table: 'devices',
			recordId: id,
		})
	},
}
