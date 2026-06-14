import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const auditLog = pgTable('audit_log', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').references(() => users.id),
	action: varchar('action', { length: 20 }).notNull(),
	table: varchar('table', { length: 50 }).notNull(),
	recordId: uuid('record_id'),
	oldValue: jsonb('old_value'),
	newValue: jsonb('new_value'),
	ipAddress: varchar('ip_address', { length: 45 }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
