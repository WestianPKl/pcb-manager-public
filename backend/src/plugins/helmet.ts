import fp from 'fastify-plugin'
import helmet from '@fastify/helmet'
import type { FastifyInstance } from 'fastify'

export default fp(async (app: FastifyInstance) => {
	await app.register(helmet)
})
