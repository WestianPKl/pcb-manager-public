import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '../db/index.js'
import { auditLog, devices, pcb, projects, sessions, users } from '../db/schema/index.js'
import { devicesService } from '../modules/devices/devices.service.js'
import { authService } from '../modules/auth/auth.service.js'
import { eq, like } from 'drizzle-orm'
import { projectsService } from '../modules/projects/projects.service.js'
import { pcbService } from '../modules/pcb/pcb.service.js'

let testUserId: string
let newProjectId: string
let newPcbId: string

function uniqueItem(suffix: string, pcbId: string) {
	return {
		name: `Device ${suffix}`,
		description: `Test device ${suffix}`,
		pcbId,
	}
}

function projectItem(sufix: string) {
	return {
		name: `Test Project ${sufix}`,
		description: `Test project description ${sufix}`,
	}
}

function pcbItem(sufix: string, projectId: string) {
	return {
		projectId,
		name: `Test PCB ${sufix}`,
		revision: `1.0.${sufix}`,
		comment: `Test PCB comment ${sufix}`,
		verified: false,
	}
}

async function cleanupAll() {
	await db
		.delete(devices)
		.where(like(devices.name, 'Device%'))
		.catch(() => {})

	const testProjectList = await db
		.select({ id: projects.id })
		.from(projects)
		.where(like(projects.name, 'Test Project%'))
		.catch(() => [] as { id: string }[])

	for (const { id: projectId } of testProjectList) {
		const testPcbList = await db
			.select({ id: pcb.id })
			.from(pcb)
			.where(eq(pcb.projectId, projectId))
			.catch(() => [] as { id: string }[])

		for (const { id: pcbId } of testPcbList) {
			await db
				.delete(devices)
				.where(eq(devices.pcbId, pcbId))
				.catch(() => {})
		}

		await db
			.delete(pcb)
			.where(eq(pcb.projectId, projectId))
			.catch(() => {})
	}

	await db
		.delete(projects)
		.where(like(projects.name, 'Test Project%'))
		.catch(() => {})
}

describe('devicesService', () => {
	beforeAll(async () => {
		await cleanupAll()

		const user = await authService.register({
			username: `devtest_${Date.now()}`,
			name: 'Dev',
			surname: 'Test',
			email: `devtest_${Date.now()}@pcbmanager.com`,
			password: 'TestPassword123!',
		})
		testUserId = user.id
	})

	afterAll(async () => {
		await cleanupAll()
		await db
			.delete(sessions)
			.where(eq(sessions.userId, testUserId))
			.catch(() => {})
		await db
			.delete(auditLog)
			.where(eq(auditLog.userId, testUserId))
			.catch(() => {})
		await db
			.delete(users)
			.where(eq(users.id, testUserId))
			.catch(() => {})
	})

	describe('createProject', () => {
		it('should create project', async () => {
			const project = await projectsService.create(projectItem('project1'), testUserId)
			expect(project).toBeDefined()
			expect(project.name).toBe('Test Project project1')
			newProjectId = project.id
		})
	})

	describe('createPcb', () => {
		it('should create PCB', async () => {
			const pcb = await pcbService.create(pcbItem('pcb1', newProjectId), testUserId)
			expect(pcb).toBeDefined()
			expect(pcb.name).toBe('Test PCB pcb1')
			newPcbId = pcb.id
		})
	})

	describe('getProject', () => {
		it('should return project', async () => {
			const project = await projectsService.getAll()
			expect(project).toBeDefined()
			expect(project.data.some(p => p.id === newProjectId)).toBe(true)
		})
	})

	describe('getPcb', () => {
		it('should return PCB', async () => {
			const pcb = await pcbService.getAll()
			expect(pcb).toBeDefined()
			expect(pcb.data.some(p => p.id === newPcbId)).toBe(true)
		})
	})

	describe('updateProject', () => {
		it('should update project', async () => {
			const updated = await projectsService.update(newProjectId, { name: 'Test Project updated' }, testUserId)
			expect(updated?.name).toBe('Test Project updated')
		})
	})

	describe('updatePcb', () => {
		it('should update PCB', async () => {
			const updated = await pcbService.update(newPcbId, { name: 'Test PCB updated' }, testUserId)
			expect(updated?.name).toBe('Test PCB updated')
		})
	})

	describe('create', () => {
		it('should create device', async () => {
			const item = await devicesService.create(uniqueItem('create1', newPcbId), testUserId)

			expect(item).toBeDefined()
			expect(item.name).toBe('Device create1')
		})
	})

	describe('update', () => {
		it('should update device', async () => {
			const item = await devicesService.create(uniqueItem('update1', newPcbId), testUserId)
			const updated = await devicesService.update(item.id, { name: 'Device updated' }, testUserId)

			expect(updated?.name).toBe('Device updated')
		})

		it('should return null for non-existent item', async () => {
			const result = await devicesService.update('00000000-0000-0000-0000-000000000000', { name: 'test' }, testUserId)
			expect(result).toBeNull()
		})
	})

	describe('delete', () => {
		it('should delete device', async () => {
			const item = await devicesService.create(uniqueItem('delete1', newPcbId), testUserId)
			await devicesService.delete(item.id, testUserId)

			const [deleted] = await db.select().from(devices).where(eq(devices.id, item.id)).limit(1)

			expect(deleted).toBeUndefined()
		})
	})

	describe('deletePcb', () => {
		it('should delete PCB', async () => {
			const newPcbItem = await pcbService.create(pcbItem('deletePcb1', newProjectId), testUserId)
			await pcbService.delete(newPcbItem.id, testUserId)

			const [deleted] = await db.select().from(pcb).where(eq(pcb.id, newPcbItem.id)).limit(1)

			expect(deleted).toBeUndefined()
		})
	})

	describe('deleteProject', () => {
		it('should delete project', async () => {
			const project = await projectsService.create(projectItem('deleteProject1'), testUserId)
			await projectsService.delete(project.id, testUserId)

			const [deleted] = await db.select().from(projects).where(eq(projects.id, project.id)).limit(1)

			expect(deleted).toBeUndefined()
		})
	})

	describe('search', () => {
		it('should find items by name', async () => {
			await devicesService.create(uniqueItem('search1', newPcbId), testUserId)

			const result = await devicesService.getAll(1, 20, {
				name: 'Device search1',
			})

			expect(result.data.length).toBeGreaterThan(0)
			expect(result.data[0].name).toBe('Device search1')
		})

		it('should return empty for non-existent name', async () => {
			const result = await devicesService.getAll(1, 20, {
				name: 'NonExistentComponent12345',
			})

			expect(result.data.length).toBe(0)
			expect(result.pagination.total).toBe(0)
		})
	})

	describe('removeInventoryUser', () => {
		it('should remove user and related sessions', async () => {
			await db
				.delete(sessions)
				.where(eq(sessions.userId, testUserId))
				.catch(() => {})
		})
		it('should remove all audit logs for the user', async () => {
			await db
				.delete(auditLog)
				.where(eq(auditLog.userId, testUserId))
				.catch(() => {})
		})
		it('should remove user', async () => {
			await db
				.delete(users)
				.where(eq(users.id, testUserId))
				.catch(() => {})
		})
	})
})
