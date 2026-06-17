import { FastifyInstance } from 'fastify'
import { inventoryService } from './inventory.service.js'
import { stockService } from './stock.service.js'
import {
	dictionarySchema,
	createInventorySchema,
	updateInventorySchema,
	searchInventorySchema,
} from './inventory.schema.js'
import { addStockSchema, removeStockSchema, searchMovementsSchema } from './stock.schema.js'
import { permissionCheck } from '../../utils/permission-check.js'

export default async function inventoryRoutes(app: FastifyInstance) {
	const auth = { onRequest: [app.authenticate] }

	app.get('/types', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		return inventoryService.getTypes()
	})
	app.post('/types', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = dictionarySchema.parse(request.body)
		const user = request.user as { id: string }
		const type = await inventoryService.createType(input, user.id)
		return reply.status(201).send(type)
	})
	app.put('/types/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = dictionarySchema.parse(request.body)
		const user = request.user as { id: string }
		const type = await inventoryService.updateType(id, input, user.id)
		if (!type) return reply.status(404).send({ error: 'Not found' })
		return type
	})
	app.delete('/types/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const user = request.user as { id: string }
		await inventoryService.deleteType(id, user.id)
		return reply.status(204).send()
	})

	app.get('/packages', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		return inventoryService.getPackages()
	})
	app.post('/packages', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = dictionarySchema.parse(request.body)
		const user = request.user as { id: string }
		const pkg = await inventoryService.createPackage(input, user.id)
		return reply.status(201).send(pkg)
	})
	app.put('/packages/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = dictionarySchema.parse(request.body)
		const user = request.user as { id: string }
		const pkg = await inventoryService.updatePackage(id, input, user.id)
		if (!pkg) return reply.status(404).send({ error: 'Not found' })
		return pkg
	})
	app.delete('/packages/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const user = request.user as { id: string }
		await inventoryService.deletePackage(id, user.id)
		return reply.status(204).send()
	})

	app.get('/surface-mounts', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		return inventoryService.getSurfaceMounts()
	})
	app.post('/surface-mounts', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = dictionarySchema.parse(request.body)
		const user = request.user as { id: string }
		const sm = await inventoryService.createSurfaceMount(input, user.id)
		return reply.status(201).send(sm)
	})
	app.put('/surface-mounts/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = dictionarySchema.parse(request.body)
		const user = request.user as { id: string }
		const sm = await inventoryService.updateSurfaceMount(id, input, user.id)
		if (!sm) return reply.status(404).send({ error: 'Not found' })
		return sm
	})
	app.delete('/surface-mounts/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const user = request.user as { id: string }
		await inventoryService.deleteSurfaceMount(id, user.id)
		return reply.status(204).send()
	})

	app.get('/shops', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		return inventoryService.getShops()
	})
	app.post('/shops', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = dictionarySchema.parse(request.body)
		const user = request.user as { id: string }
		const shop = await inventoryService.createShop(input, user.id)
		return reply.status(201).send(shop)
	})
	app.put('/shops/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = dictionarySchema.parse(request.body)
		const user = request.user as { id: string }
		const shop = await inventoryService.updateShop(id, input, user.id)
		if (!shop) return reply.status(404).send({ error: 'Not found' })
		return shop
	})
	app.delete('/shops/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const user = request.user as { id: string }
		await inventoryService.deleteShop(id, user.id)
		return reply.status(204).send()
	})

	app.get('/', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { page, limit, ...filters } = searchInventorySchema.parse(request.query)
		return inventoryService.getAll(page, limit, filters)
	})
	app.post('/search', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = searchInventorySchema.parse(request.body)
		return inventoryService.getAll(input.page, input.limit, input)
	})
	app.get('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const item = await inventoryService.getById(id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})
	app.post('/', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = createInventorySchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await inventoryService.create(input, user.id)
		return reply.status(201).send(item)
	})
	app.put('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = updateInventorySchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await inventoryService.update(id, input, user.id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})
	app.delete('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const user = request.user as { id: string }
		await inventoryService.delete(id, user.id)
		return reply.status(204).send()
	})

	app.get('/:id/stock', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const stock = await stockService.getStock(id)
		if (!stock) return reply.status(404).send({ error: 'Nie znaleziono' })
		return stock
	})

	app.post('/:id/stock/add', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = addStockSchema.parse(request.body)
		const user = request.user as { id: string }
		const stock = await stockService.addStock(id, input, user.id)
		return reply.send(stock)
	})

	app.post('/:id/stock/remove', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = removeStockSchema.parse(request.body)
		const user = request.user as { id: string }
		try {
			const stock = await stockService.removeStock(id, input, user.id)
			return reply.send(stock)
		} catch (err: any) {
			if (err.message === 'INSUFFICIENT_STOCK') {
				return reply.status(400).send({ error: 'Niewystarczający stan magazynowy' })
			}
			if (err.message === 'STOCK_NOT_FOUND') {
				return reply.status(404).send({ error: 'Nie znaleziono' })
			}
			throw err
		}
	})

	app.post('/movements/search', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'inventory', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = searchMovementsSchema.parse(request.body)
		return stockService.getMovements(input)
	})
}
