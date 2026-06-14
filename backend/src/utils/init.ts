import { authService } from '../modules/auth/auth.service.js'
import { adminService } from '../modules/admin/admin.service.js'
import { env } from '../config/env.js'

let userId: string | undefined = undefined
let permissionIds: string[] = []

async function createAdminUser(): Promise<number> {
	const users = await authService.getAllUsers()

	if (users.length > 0) {
		return 0
	}

	const adminUserName = env.ADMIN_USERNAME || 'adminadmin'
	const adminEmail = env.ADMIN_EMAIL || 'admin@admin.com'
	const adminName = env.ADMIN_NAME || 'Admin'
	const adminSurname = env.ADMIN_SURNAME || 'User'
	const adminPassword = env.ADMIN_PASSWORD || 'admin123'

	const input = {
		username: adminUserName,
		email: adminEmail,
		name: adminName,
		surname: adminSurname,
		password: adminPassword,
	}

	const user = await authService.register(input)
	userId = user.id

	return 1
}

async function createAccessLevels() {
	const levels = [
		{ accessLevel: 1, name: 'READ' },
		{ accessLevel: 2, name: 'WRITE' },
		{ accessLevel: 3, name: 'DELETE' },
		{ accessLevel: 4, name: 'ADMIN' },
	]

	if (!userId) {
		throw new Error('Admin user ID is not defined. Please create the admin user first.')
	}

	for (const level of levels) {
		await adminService.createAccessLevel(level, userId)
	}
}

async function createFunctionalities() {
	const functionalities = [
		{ name: 'admin', description: 'Admin functionality' },
		{ name: 'devices', description: 'Devices functionality' },
		{ name: 'inventory', description: 'Inventory functionality' },
		{ name: 'audit', description: 'Audit functionality' },
		{ name: 'pcb', description: 'PCB functionality' },
		{ name: 'production', description: 'Production functionality' },
		{ name: 'projects', description: 'Projects functionality' },
	]
	if (!userId) {
		throw new Error('Admin user ID is not defined. Please create the admin user first.')
	}

	for (const func of functionalities) {
		await adminService.createFunctionality(func, userId)
	}
}

async function createAdminPermissions() {
	const functionalities = await adminService.getFunctionalities()

	if (functionalities.length === 0) {
		throw new Error('No functionalities found. Please create functionalities first.')
	}

	if (!userId) {
		throw new Error('Admin user ID is not defined. Please create the admin user first.')
	}

	for (const func of functionalities) {
		const permission = { name: func.name.toUpperCase(), functionalityId: func.id, accessLevelId: 4 }
		const data = await adminService.createPermission(permission, userId)
		permissionIds.push(data.id)
	}
}

async function assignAdminPermissionsToUser() {
	if (permissionIds.length === 0) {
		throw new Error('No permissions found. Please create permissions first.')
	}

	if (!userId) {
		throw new Error('Admin user ID is not defined. Please create the admin user first.')
	}

	for (const permissionId of permissionIds) {
		await adminService.assignPermissionToUser({ userId, permissionId }, userId)
	}
}

function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

async function init() {
	const adminCreated = await createAdminUser()
	if (adminCreated === 0) {
		console.log('Admin user already exists. Skipping initialization.')
		return
	}
	await delay(1000)
	await createAccessLevels()
	await delay(1000)
	await createFunctionalities()
	await delay(1000)
	await createAdminPermissions()
	await delay(1000)
	await assignAdminPermissionsToUser()
}

init().catch(console.error)
