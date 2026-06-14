import { z } from 'zod'

export const registerSchema = z.object({
	username: z.string().min(3).max(255),
	name: z.string().min(1).max(255),
	surname: z.string().min(1).max(255),
	email: z.string().email(),
	password: z.string().min(8),
})

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
