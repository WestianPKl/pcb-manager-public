import fp from 'fastify-plugin'
import { db } from '../db/index'
import type { FastifyInstance } from 'fastify'

declare module 'fastify' {
	interface FastifyInstance {
		db: typeof db
		authenticate: (request: any, reply: any) => Promise<void>
	}
}

export default fp(async (app: FastifyInstance) => {
	app.decorate('db', db)
})
