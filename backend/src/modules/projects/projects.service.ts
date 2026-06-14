import { eq, ilike, sql, and } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '../../db/index.js'
import { projects, users } from '../../db/schema/index.js'
import type { CreateProjectInput, UpdateProjectInput, SearchProjectInput } from './projects.schema.js'
import { audit } from '../../utils/audit.js'

const createdByUser = alias(users, 'created_by_user')
const updatedByUser = alias(users, 'updated_by_user')

export const projectsService = {
	async getAll(page = 1, limit = 20) {
		const offset = (page - 1) * limit

		const [data, countResult] = await Promise.all([
			db
				.select({
					id: projects.id,
					name: projects.name,
					description: projects.description,
					createdById: projects.createdById,
					updatedById: projects.updatedById,
					createdAt: projects.createdAt,
					updatedAt: projects.updatedAt,
					createdBy: createdByUser.name,
					updatedBy: updatedByUser.name,
				})
				.from(projects)
				.leftJoin(createdByUser, eq(createdByUser.id, projects.createdById))
				.leftJoin(updatedByUser, eq(updatedByUser.id, projects.updatedById))
				.orderBy(projects.name)
				.limit(limit)
				.offset(offset),

			db.select({ count: sql<number>`cast(count(*) as integer)` }).from(projects),
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

	async search(input: SearchProjectInput) {
		const conditions = []
		const offset = (input.page - 1) * input.limit

		if (input.name) {
			conditions.push(ilike(projects.name, `%${input.name}%`))
		}

		const [data, countResult] = await Promise.all([
			db
				.select({
					id: projects.id,
					name: projects.name,
					description: projects.description,
					createdById: projects.createdById,
					updatedById: projects.updatedById,
					createdAt: projects.createdAt,
					updatedAt: projects.updatedAt,
					createdBy: createdByUser.name,
					updatedBy: updatedByUser.name,
				})
				.from(projects)
				.leftJoin(createdByUser, eq(createdByUser.id, projects.createdById))
				.leftJoin(updatedByUser, eq(updatedByUser.id, projects.updatedById))
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(projects.name)
				.limit(input.limit)
				.offset(offset),

			db
				.select({ count: sql<number>`cast(count(*) as integer)` })
				.from(projects)
				.where(conditions.length > 0 ? and(...conditions) : undefined),
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
		const [project] = await db
			.select({
				id: projects.id,
				name: projects.name,
				description: projects.description,
				createdById: projects.createdById,
				updatedById: projects.updatedById,
				createdAt: projects.createdAt,
				updatedAt: projects.updatedAt,
				createdBy: createdByUser.name,
				updatedBy: updatedByUser.name,
			})
			.from(projects)
			.leftJoin(createdByUser, eq(createdByUser.id, projects.createdById))
			.leftJoin(updatedByUser, eq(updatedByUser.id, projects.updatedById))
			.where(eq(projects.id, id))
			.limit(1)

		return project ?? null
	},

	async create(input: CreateProjectInput, userId: string) {
		const [project] = await db
			.insert(projects)
			.values({
				...input,
				createdById: userId,
				updatedById: userId,
			})
			.returning()

		await audit({
			userId,
			action: 'CREATE',
			table: 'projects',
			recordId: project.id,
			newValue: project,
		})
		return project
	},

	async update(id: string, input: UpdateProjectInput, userId: string) {
		const [project] = await db
			.update(projects)
			.set({
				...input,
				updatedById: userId,
				updatedAt: new Date(),
			})
			.where(eq(projects.id, id))
			.returning()

		await audit({
			userId,
			action: 'UPDATE',
			table: 'projects',
			recordId: project.id,
			newValue: project,
		})
		return project ?? null
	},

	async delete(id: string, userId: string) {
		await db.delete(projects).where(eq(projects.id, id))
		await audit({
			userId,
			action: 'DELETE',
			table: 'projects',
			recordId: id,
		})
	},
}
