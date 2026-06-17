import Fastify from 'fastify'
import { ZodError } from 'zod'
import { env } from './config/env'
import corsPlugin from './plugins/cors'
import helmetPlugin from './plugins/helmet'
import rateLimitPlugin from './plugins/rate-limit'
import jwtPlugin from './plugins/jwt'
import dbPlugin from './plugins/db'
import storagePlugin from './plugins/storage.js'
import multipart from '@fastify/multipart'
import swaggerPlugin from './plugins/swagger.js'
import authRoutes from './modules/auth/auth.routes'
import inventoryRoutes from './modules/inventory/inventory.routes.js'
import projectsRoutes from './modules/projects/projects.routes.js'
import pcbRoutes from './modules/pcb/pcb.routes.js'
import devicesRoutes from './modules/devices/devices.routes.js'
import productionRoutes from './modules/production/production.routes.js'
import dashboardRoutes from './modules/dashboard/dashboard.routes.js'
import auditRoutes from './modules/audit/audit.routes.js'
import adminRoutes from './modules/admin/admin.routes.js'
import { startScheduler } from './utils/scheduler.js'

const app = Fastify({
	logger: true,
})

app.register(corsPlugin)
app.register(helmetPlugin)
app.register(rateLimitPlugin)
app.register(jwtPlugin)
app.register(dbPlugin)
app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } })
app.register(storagePlugin)
if (env.SWAGGER_ENABLED === 'true') {
	await app.register(swaggerPlugin)
}
app.register(authRoutes, { prefix: '/api/v1/auth' })
app.register(inventoryRoutes, { prefix: '/api/v1/inventory' })
app.register(projectsRoutes, { prefix: '/api/v1/projects' })
app.register(pcbRoutes, { prefix: '/api/v1/pcb' })
app.register(devicesRoutes, { prefix: '/api/v1/devices' })
app.register(productionRoutes, { prefix: '/api/v1/production' })
app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' })
app.register(auditRoutes, { prefix: '/api/v1/audit' })
app.register(adminRoutes, { prefix: '/api/v1/admin' })

app.get('/health', async () => {
	return { status: 'ok', timestamp: new Date().toISOString() }
})

const start = async () => {
	try {
		await app.listen({
			port: env.PORT,
			host: env.HOST,
		})
		startScheduler()
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

app.setErrorHandler((error: unknown, request, reply) => {
	if (error instanceof ZodError) {
		return reply.status(400).send({
			statusCode: 400,
			error: 'Validation Error',
			message: error.issues,
		})
	}

	const jwtErrors = [
		'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED',
		'FST_JWT_NO_AUTHORIZATION_IN_HEADER',
		'FST_JWT_AUTHORIZATION_TOKEN_INVALID',
		'FST_JWT_BAD_REQUEST',
	]

	if (jwtErrors.includes((error as any).code)) {
		return reply.status(401).send({
			statusCode: 401,
			error: 'Unauthorized',
			message: (error as any).message,
		})
	}

	app.log.error(error)
	return reply.status((error as any).statusCode ?? 500).send({
		statusCode: (error as any).statusCode ?? 500,
		error: (error as any).statusCode === 500 ? 'Internal Server Error' : (error as any).message,
		message: 'Something went wrong',
	})
})

start()
