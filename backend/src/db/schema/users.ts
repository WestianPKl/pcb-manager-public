import { pgTable, uuid, varchar, timestamp, index, foreignKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { userPermissions } from './permissions.js'

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	username: varchar('username', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	surname: varchar('surname', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	password: varchar('password', { length: 255 }).notNull(),
	avatar: varchar('avatar', { length: 255 }),
	avatarBig: varchar('avatar_big', { length: 255 }),
	resetPasswordToken: varchar('reset_password_token', { length: 255 }),
	resetPasswordExpires: timestamp('reset_password_expires', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const userRelations = relations(users, ({ many }) => ({
	permissions: many(userPermissions),
}))

export const sessions = pgTable(
	'sessions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		tokenHash: varchar('token_hash', { length: 255 }).notNull(),
		userId: uuid('user_id').notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		revokedAt: timestamp('revoked_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
	},
	table => ({
		userIdIdx: index('sessions_user_id_idx').on(table.userId),
		userFk: foreignKey({
			name: 'sessions_user_fk',
			columns: [table.userId],
			foreignColumns: [users.id],
		}),
	}),
)
