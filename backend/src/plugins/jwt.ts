import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import { env } from '../config/env'
import type { FastifyInstance } from 'fastify'

export default fp(async (app: FastifyInstance) => {
	await app.register(fastifyCookie)

	await app.register(fastifyJwt, {
		secret: env.JWT_SECRET,
	})

	app.decorate('authenticate', async (request: any, reply: any) => {
		try {
			await request.jwtVerify()
		} catch (err) {
			reply.send(err)
		}
	})
})
