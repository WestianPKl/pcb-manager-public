import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

export default fp(async (app: FastifyInstance) => {
	await app.register(swagger, {
		openapi: {
			openapi: '3.0.0',
			info: {
				title: 'PCB Manager API',
				description: 'API documentation for PCB Manager',
				version: '1.0.0',
			},
			servers: [{ url: 'http://localhost:3000' }],
			components: {
				securitySchemes: {
					bearerAuth: {
						type: 'http',
						scheme: 'bearer',
						bearerFormat: 'JWT',
					},
				},
			},
			security: [{ bearerAuth: [] }],
		},
	})

	await app.register(swaggerUi, {
		routePrefix: '/docs',
		uiConfig: {
			docExpansion: 'list',
			deepLinking: true,
			tryItOutEnabled: true,
		},
	})
})
