import { z } from 'zod'

export const createProjectSchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().optional(),
})

export const updateProjectSchema = createProjectSchema.partial()

export const searchProjectSchema = createProjectSchema.partial().extend({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type SearchProjectInput = z.infer<typeof searchProjectSchema>
