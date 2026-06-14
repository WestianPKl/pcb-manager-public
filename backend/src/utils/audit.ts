import { db } from '../db/index.js'
import { auditLog } from '../db/schema/index.js'

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

interface AuditOptions {
	userId: string | null
	action: AuditAction
	table: string
	recordId?: string
	oldValue?: Record<string, any> | null
	newValue?: Record<string, any> | null
	ipAddress?: string
}

export async function audit(options: AuditOptions): Promise<void> {
	try {
		await db.insert(auditLog).values({
			userId: options.userId,
			action: options.action,
			table: options.table,
			recordId: options.recordId,
			oldValue: options.oldValue ?? null,
			newValue: options.newValue ?? null,
			ipAddress: options.ipAddress,
		})
	} catch (err) {
		console.error('Audit log error:', err)
	}
}
