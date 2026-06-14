import { FastifyInstance } from 'fastify'
import { productionService } from './production.service.js'
import {
	createProductionOrderSchema,
	updateProductionOrderSchema,
	searchProductionOrderSchema,
	createOrderItemSchema,
	updateOrderItemSchema,
} from './production.schema.js'
import { paginationSchema } from '../../utils/schemas.js'
import { permissionCheck } from '../../utils/permission-check.js'

export default async function productionRoutes(app: FastifyInstance) {
	const auth = { onRequest: [app.authenticate] }

	app.get('/', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'production', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { page, limit } = paginationSchema.parse(request.query)
		return productionService.getAll(page, limit)
	})

	app.post('/search', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'production', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = searchProductionOrderSchema.parse(request.body)
		return productionService.search(input)
	})

	app.get('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'production', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const item = await productionService.getById(id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})

	app.post('/', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'production', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = createProductionOrderSchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await productionService.create(input, user.id)
		return reply.status(201).send(item)
	})

	app.put('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'production', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = updateProductionOrderSchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await productionService.update(id, input, user.id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})

	app.delete('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'production', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const user = request.user as { id: string }
		await productionService.delete(id, user.id)
		return reply.status(204).send()
	})

	app.get('/:id/items', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'production', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		return productionService.getItems(id)
	})

	app.post('/:id/items', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'production', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = createOrderItemSchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await productionService.addItem(id, input, user.id)
		return reply.status(201).send(item)
	})

	app.put('/items/:itemId', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'production', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { itemId } = request.params as { itemId: string }
		const input = updateOrderItemSchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await productionService.updateItem(itemId, input, user.id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})

	app.delete('/items/:itemId', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'production', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { itemId } = request.params as { itemId: string }
		const user = request.user as { id: string }
		await productionService.deleteItem(itemId, user.id)
		return reply.status(204).send()
	})

	app.post('/:id/consume', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'production', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const user = request.user as { id: string }
		await productionService.consume(id, user.id)
		return reply.send({ message: 'Components consumed, order completed' })
	})
}
