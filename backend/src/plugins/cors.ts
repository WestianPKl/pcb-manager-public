import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import { env } from '../config/env'
import type { FastifyInstance } from 'fastify'

export default fp(async (app: FastifyInstance) => {
	await app.register(cors, {
		origin: env.NODE_ENV === 'development' ? true : ['https://pcb-manager.com', 'http://192.168.18.158'],
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
})
