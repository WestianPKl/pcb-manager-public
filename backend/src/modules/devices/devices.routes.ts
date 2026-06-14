import { FastifyInstance } from 'fastify'
import { devicesService } from './devices.service.js'
import { createDeviceSchema, updateDeviceSchema, searchDeviceSchema } from './devices.schema.js'
import { paginationSchema } from '../../utils/schemas.js'
import { permissionCheck } from '../../utils/permission-check.js'

export default async function devicesRoutes(app: FastifyInstance) {
	const auth = { onRequest: [app.authenticate] }
	app.get('/', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'devices', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { page, limit } = paginationSchema.parse(request.query)
		return devicesService.getAll(page, limit)
	})

	app.post('/search', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'devices', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = searchDeviceSchema.parse(request.body)
		return devicesService.search(input)
	})

	app.get('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'devices', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const item = await devicesService.getById(id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})

	app.post('/', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'devices', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = createDeviceSchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await devicesService.create(input, user.id)
		return reply.status(201).send(item)
	})

	app.put('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'devices', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = updateDeviceSchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await devicesService.update(id, input, user.id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})

	app.post('/claim/:claimToken', async (request, reply) => {
		const { claimToken } = request.params as { claimToken: string }
		const user = request.user as { id: string }
		const item = await devicesService.claim(claimToken, user.id)
		if (!item) return reply.status(404).send({ error: 'Invalid claim token' })
		return item
	})

	app.post('/:id/regenerate-claim', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'devices', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const user = request.user as { id: string }
		const item = await devicesService.regenerateClaimToken(id, user.id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})

	app.delete('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'devices', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const user = request.user as { id: string }
		await devicesService.delete(id, user.id)
		return reply.status(204).send()
	})
}
