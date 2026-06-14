import { FastifyInstance } from 'fastify'
import { dashboardService } from './dashboard.service.js'

export default async function dashboardRoutes(app: FastifyInstance) {
	const auth = { onRequest: [app.authenticate] }

	app.get('/stats', auth, async () => {
		return dashboardService.getStats()
	})

	app.get('/low-stock', auth, async () => {
		return dashboardService.getLowStock()
	})

	app.get('/recent-inventory', auth, async () => {
		return dashboardService.getRecentInventory()
	})

	app.get('/recent-production', auth, async () => {
		return dashboardService.getRecentProduction()
	})

	app.get('/production-history', auth, async () => {
		return dashboardService.getProductionHistory()
	})
}
