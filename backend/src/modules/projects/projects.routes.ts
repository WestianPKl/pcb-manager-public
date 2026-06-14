import { FastifyInstance } from 'fastify'
import { projectsService } from './projects.service.js'
import { createProjectSchema, updateProjectSchema, searchProjectSchema } from './projects.schema.js'
import { paginationSchema } from '../../utils/schemas.js'
import { permissionCheck } from '../../utils/permission-check.js'

export default async function projectsRoutes(app: FastifyInstance) {
	const auth = { onRequest: [app.authenticate] }

	app.get('/', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'projects', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { page, limit } = paginationSchema.parse(request.query)
		return projectsService.getAll(page, limit)
	})

	app.post('/search', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'projects', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = searchProjectSchema.parse(request.body)
		return projectsService.search(input)
	})

	app.get('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'projects', 'READ')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const project = await projectsService.getById(id)
		if (!project) return reply.status(404).send({ error: 'Not found' })
		return project
	})

	app.post('/', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'projects', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const input = createProjectSchema.parse(request.body)
		const user = request.user as { id: string }
		const project = await projectsService.create(input, user.id)
		return reply.status(201).send(project)
	})

	app.put('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'projects', 'WRITE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const input = updateProjectSchema.parse(request.body)
		const user = request.user as { id: string }
		const project = await projectsService.update(id, input, user.id)
		if (!project) return reply.status(404).send({ error: 'Not found' })
		return project
	})

	app.delete('/:id', auth, async (request, reply) => {
		const hasPermission = await permissionCheck(request, 'projects', 'DELETE')
		if (!hasPermission) {
			return reply.status(403).send({ error: 'Forbidden' })
		}
		const { id } = request.params as { id: string }
		const user = request.user as { id: string }
		await projectsService.delete(id, user.id)
		return reply.status(204).send()
	})
}
