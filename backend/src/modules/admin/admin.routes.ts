import { FastifyInstance } from 'fastify'
import { adminService } from './admin.service.js'
import {
	createAccessLevelsSchema,
	updateAccessLevelsSchema,
	createFunctionalitySchema,
	updateFunctionalitySchema,
	createPermissionsSchema,
	updatePermissionsSchema,
	searchPermissionsSchema,
	assignPermissionToUserSchema,
} from './admin.schema.js'
import { paginationSchema } from '../../utils/schemas.js'
import { permissionCheck } from '../../utils/permission-check.js'

export default async function adminRoutes(app: FastifyInstance) {
	const auth = { onRequest: [app.authenticate] }

	app.get('/access-levels', auth, async (request, reply) => {
		return adminService.getAccessLevels()
	})
	app.post('/access-levels', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const user = request.user as { id: string }
		const input = createAccessLevelsSchema.parse(request.body)
		const item = await adminService.createAccessLevel(input, user.id)
		return reply.status(201).send(item)
	})
	app.put('/access-levels/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: number }
		const input = updateAccessLevelsSchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await adminService.updateAccessLevel(id, input, user.id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})
	app.delete('/access-levels/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: number }
		const user = request.user as { id: string }
		await adminService.deleteAccessLevel(id, user.id)
		return reply.status(204).send()
	})

	app.get('/functionalities', auth, async (request, reply) => {
		return adminService.getFunctionalities()
	})
	app.post('/functionalities', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const user = request.user as { id: string }
		const input = createFunctionalitySchema.parse(request.body)
		const item = await adminService.createFunctionality(input, user.id)
		return reply.status(201).send(item)
	})
	app.put('/functionalities/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = updateFunctionalitySchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await adminService.updateFunctionality(id, input, user.id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})
	app.delete('/functionalities/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const user = request.user as { id: string }
		await adminService.deleteFunctionality(id, user.id)
		return reply.status(204).send()
	})

	app.get('/permissions', auth, async (request, reply) => {
		const { page, limit } = paginationSchema.parse(request.query)
		return adminService.getPermissionsAll(page, limit)
	})
	app.post('/permissions/search', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = searchPermissionsSchema.parse(request.body)
		return adminService.getPermissionsSearch(input)
	})
	app.get('/permissions/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const item = await adminService.getPermissionById(id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})
	app.post('/permissions', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = createPermissionsSchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await adminService.createPermission(input, user.id)
		return reply.status(201).send(item)
	})
	app.put('/permissions/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = updatePermissionsSchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await adminService.updatePermission(id, input, user.id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})
	app.delete('/permissions/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const user = request.user as { id: string }
		await adminService.deletePermission(id, user.id)
		return reply.status(204).send()
	})

	app.get('/users', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		return adminService.getAllUsers()
	})

	app.get('/permissions/:id/users', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		return adminService.getUsersForPermission(id)
	})

	app.post('/permissions/assign', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = assignPermissionToUserSchema.parse(request.body)
		const user = request.user as { id: string }
		await adminService.assignPermissionToUser(input, user.id)
		return reply.status(204).send()
	})
	app.delete('/permissions/revoke', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'admin', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = assignPermissionToUserSchema.parse(request.body)
		const user = request.user as { id: string }
		await adminService.revokePermissionFromUser(input, user.id)
		return reply.status(204).send()
	})
}
