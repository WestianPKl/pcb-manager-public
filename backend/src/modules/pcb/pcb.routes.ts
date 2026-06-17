import { FastifyInstance } from 'fastify'
import { pcbService } from './pcb.service.js'
import {
	createPcbSchema,
	updatePcbSchema,
	searchPcbSchema,
	createBomItemSchema,
	updateBomItemSchema,
} from './pcb.schema.js'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index'
import { pcb } from '../../db/schema/pcb.js'
import sharp from 'sharp'
import { permissionCheck } from '../../utils/permission-check.js'

export default async function pcbRoutes(app: FastifyInstance) {
	const auth = { onRequest: [app.authenticate] }

	app.get('/', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'devices', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { page, limit, ...filters } = searchPcbSchema.parse(request.query)
		return pcbService.getAll(page, limit, filters)
	})

	app.post('/search', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'devices', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = searchPcbSchema.parse(request.body)
		return pcbService.getAll(input.page, input.limit, input)
	})

	app.get('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'devices', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const item = await pcbService.getById(id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})

	app.post('/', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'pcb', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = createPcbSchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await pcbService.create(input, user.id)
		return reply.status(201).send(item)
	})

	app.put('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'pcb', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = updatePcbSchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await pcbService.update(id, input, user.id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})

	app.delete('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'pcb', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const user = request.user as { id: string }
		await pcbService.delete(id, user.id)
		return reply.status(204).send()
	})

	app.get('/:id/bom', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'pcb', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		return pcbService.getBom(id)
	})

	app.post('/:id/bom', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'pcb', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = createBomItemSchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await pcbService.addBomItem(id, input, user.id)
		return reply.status(201).send(item)
	})

	app.put('/bom/:bomId', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'pcb', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { bomId } = request.params as { bomId: string }
		const input = updateBomItemSchema.parse(request.body)
		const user = request.user as { id: string }
		const item = await pcbService.updateBomItem(bomId, input, user.id)
		if (!item) return reply.status(404).send({ error: 'Not found' })
		return item
	})

	app.delete('/bom/:bomId', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'pcb', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { bomId } = request.params as { bomId: string }
		const user = request.user as { id: string }
		await pcbService.deleteBomItem(bomId, user.id)
		return reply.status(204).send()
	})

	app.post('/:id/images', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'pcb', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }

		const [currentPcb] = await db
			.select({ topUrl: pcb.topUrl, bottomUrl: pcb.bottomUrl })
			.from(pcb)
			.where(eq(pcb.id, id))
			.limit(1)

		const parts = request.files()
		const urls: { top?: string; bottom?: string } = {}

		for await (const part of parts) {
			const allowed = ['image/jpeg', 'image/png', 'image/webp']
			if (!allowed.includes(part.mimetype)) continue

			const buffer = await part.toBuffer()

			const processed = await sharp(buffer)
				.resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
				.webp({ quality: 90 })
				.toBuffer()

			const url = await app.storage.upload('pcb-images', processed, part.filename, 'image/webp')

			if (part.fieldname === 'top') urls.top = url
			if (part.fieldname === 'bottom') urls.bottom = url
		}

		await Promise.allSettled([
			urls.top && currentPcb?.topUrl && app.storage.deleteByUrl('pcb-images', currentPcb.topUrl),
			urls.bottom && currentPcb?.bottomUrl && app.storage.deleteByUrl('pcb-images', currentPcb.bottomUrl),
		])

		const user = request.user as { id: string }

		await db
			.update(pcb)
			.set({
				...(urls.top && { topUrl: urls.top }),
				...(urls.bottom && { bottomUrl: urls.bottom }),
				updatedById: user.id,
				updatedAt: new Date(),
			})
			.where(eq(pcb.id, id))

		return reply.send(urls)
	})
}
