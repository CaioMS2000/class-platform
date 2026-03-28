import { config } from 'dotenv'
import { z } from 'zod'

const isTest = process.env.NODE_ENV === 'test'

config({
	path: isTest ? '.env.test' : '.env',
	override: !isTest,
})

export const envSchema = z.object({
	// Environment machine
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),

	// HTTP Server
	PORT: z.coerce.number().catch(8005),

	// Database
	DATABASE_URL: z.string(),

	// JWT (RS256)
	JWT_PRIVATE_KEY: z.string(),
	JWT_PUBLIC_KEY: z.string(),

	// OAuth - Google
	GOOGLE_CLIENT_ID: z.string().default(''),
	GOOGLE_CLIENT_SECRET: z.string().default(''),
	GOOGLE_REDIRECT_URI: z.string().default(''),

	// OAuth - Frontend callback URL
	OAUTH_FRONTEND_CALLBACK_URL: z.string().default(''),

	// Redis
	REDIS_URL: z.string().default('redis://localhost:6380'),
})

const env = envSchema.parse(process.env)

export { env }
