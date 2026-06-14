import { FastifyInstance } from 'fastify'
import { db } from '../../db/index.js'
import { auditLog } from '../../db/schema/index.js'
import { users } from '../../db/schema/users.js'
import { desc, eq, and, sql } from 'drizzle-orm'
import { z } from 'zod'
import { permissionCheck } from '../../utils/permission-check.js'

const querySchema = z.object({
	table: z.string().optional(),
	action: z.enum(['CREATE', 'UPDATE', 'DELETE']).optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
})

export default async function auditRoutes(app: FastifyInstance) {
	app.get(
		'/',
		{
			onRequest: [app.authenticate],
			schema: {
				tags: ['Audit'],
				summary: 'Get audit log',
			},
		},
		async (request, reply) => {
			const hasPermission = await permissionCheck(request, 'audit', 'READ')
			if (!hasPermission) {
				return reply.status(403).send({ error: 'Forbidden' })
			}
			const { table, action, page, limit } = querySchema.parse(request.query)
			const offset = (page - 1) * limit

			const conditions = []
			if (table) conditions.push(eq(auditLog.table, table))
			if (action) conditions.push(eq(auditLog.action, action))

			const where = conditions.length > 0 ? and(...conditions) : undefined

			const [data, countResult] = await Promise.all([
				db
					.select({
						id: auditLog.id,
						action: auditLog.action,
						table: auditLog.table,
						recordId: auditLog.recordId,
						oldValue: auditLog.oldValue,
						newValue: auditLog.newValue,
						ipAddress: auditLog.ipAddress,
						createdAt: auditLog.createdAt,
						userName: users.name,
						userEmail: users.email,
					})
					.from(auditLog)
					.leftJoin(users, eq(users.id, auditLog.userId))
					.where(where)
					.orderBy(desc(auditLog.createdAt))
					.limit(limit)
					.offset(offset),

				db
					.select({ count: sql<number>`cast(count(*) as integer)` })
					.from(auditLog)
					.where(where),
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
	)
}
