import { z } from 'zod'
import 'dotenv/config'

const envSchema = z.object({
	PORT: z.coerce.number().default(3000),
	HOST: z.string().default('0.0.0.0'),
	SWAGGER_ENABLED: z.enum(['true', 'false']).default('false'),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

	DB_HOST: z.string(),
	DB_PORT: z.coerce.number().default(5432),
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_NAME: z.string(),

	JWT_SECRET: z.string().min(32),
	JWT_ACCESS_EXPIRES: z.string().default('15m'),
	JWT_REFRESH_EXPIRES: z.string().default('30d'),

	MINIO_ENDPOINT: z.string(),
	MINIO_USER: z.string(),
	MINIO_PASSWORD: z.string(),

	GMAIL_USER: z.string().email().optional(),
	GMAIL_PASSWORD: z.string().optional(),
	FRONTEND_URL: z.string().default('http://localhost:3001'),

	ADMIN_USERNAME: z.string().min(5),
	ADMIN_EMAIL: z.string().email(),
	ADMIN_NAME: z.string().min(1),
	ADMIN_SURNAME: z.string().min(1),
	ADMIN_PASSWORD: z.string().min(8),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
	console.error('❌ Environment configuration error')
	console.error(parsed.error.flatten().fieldErrors)
	process.exit(1)
}

export const env = parsed.data
