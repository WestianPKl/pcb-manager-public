import { pgTable, uuid, varchar, integer, timestamp, index, primaryKey, foreignKey } from 'drizzle-orm/pg-core'
import { users } from './users'
import { relations } from 'drizzle-orm'

export const permissionFunctionality = pgTable('permission_functionality', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 45 }).notNull().unique(),
	description: varchar('description', { length: 255 }),
})

export const permissionAccessLevel = pgTable('permission_access_level', {
	accessLevel: integer('access_level').primaryKey(),
	name: varchar('name', { length: 45 }).notNull(),
})

export const permissions = pgTable(
	'permissions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: varchar('name', { length: 45 }).notNull(),
		functionalityId: uuid('functionality_id').notNull(),
		accessLevelId: integer('access_level_id').notNull(),
		createdById: uuid('created_by_id').notNull(),
		updatedById: uuid('updated_by_id').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
	},
	table => ({
		functionalityIdIdx: index('permissions_functionality_id_idx').on(table.functionalityId),
		accessLevelIdIdx: index('permissions_access_level_id_idx').on(table.accessLevelId),
		createdByIdIdx: index('permissions_created_by_id_idx').on(table.createdById),
		updatedByIdIdx: index('permissions_updated_by_id_idx').on(table.updatedById),
		functionalityFk: foreignKey({
			name: 'permissions_functionality_fk',
			columns: [table.functionalityId],
			foreignColumns: [permissionFunctionality.id],
		}),
		accessLevelFk: foreignKey({
			name: 'permissions_access_level_fk',
			columns: [table.accessLevelId],
			foreignColumns: [permissionAccessLevel.accessLevel],
		}),
		createdByFk: foreignKey({
			name: 'permissions_created_by_fk',
			columns: [table.createdById],
			foreignColumns: [users.id],
		}),
		updatedByFk: foreignKey({
			name: 'permissions_updated_by_fk',
			columns: [table.updatedById],
			foreignColumns: [users.id],
		}),
	}),
)

export const userPermissions = pgTable(
	'user_permissions',
	{
		userId: uuid('user_id').notNull(),
		permissionId: uuid('permission_id').notNull(),
	},
	table => ({
		pk: primaryKey({ columns: [table.userId, table.permissionId] }),
		userFk: foreignKey({
			name: 'user_permissions_user_fk',
			columns: [table.userId],
			foreignColumns: [users.id],
		}),
		permissionFk: foreignKey({
			name: 'user_permissions_permission_fk',
			columns: [table.permissionId],
			foreignColumns: [permissions.id],
		}),
	}),
)

export const permissionRelations = relations(permissions, ({ many, one }) => ({
	users: many(userPermissions),
	functionality: one(permissionFunctionality, {
		fields: [permissions.functionalityId],
		references: [permissionFunctionality.id],
	}),
	accessLevel: one(permissionAccessLevel, {
		fields: [permissions.accessLevelId],
		references: [permissionAccessLevel.accessLevel],
	}),
	createdBy: one(users, {
		fields: [permissions.createdById],
		references: [users.id],
	}),
	updatedBy: one(users, {
		fields: [permissions.updatedById],
		references: [users.id],
	}),
}))

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
	user: one(users, {
		fields: [userPermissions.userId],
		references: [users.id],
	}),
	permission: one(permissions, {
		fields: [userPermissions.permissionId],
		references: [permissions.id],
	}),
}))
