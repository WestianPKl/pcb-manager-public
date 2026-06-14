import { lt, or, isNotNull } from 'drizzle-orm'
import { db } from '../db/index.js'
import { sessions } from '../db/schema/index.js'

const INTERVAL_MS = 24 * 60 * 60 * 1000 // 24h

async function cleanupSessions() {
	const result = await db
		.delete(sessions)
		.where(or(lt(sessions.expiresAt, new Date()), isNotNull(sessions.revokedAt)))
		.returning({ id: sessions.id })

	if (result.length > 0) {
		console.log(`[scheduler] Cleaned up ${result.length} expired/revoked sessions`)
	}
}

export function startScheduler() {
	cleanupSessions().catch(console.error)
	setInterval(() => cleanupSessions().catch(console.error), INTERVAL_MS)
}
