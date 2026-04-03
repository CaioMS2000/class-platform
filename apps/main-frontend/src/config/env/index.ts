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
	API_URL: z.coerce.string().catch('http://localhost:8005'),
})

const env = envSchema.parse(process.env)

export { env }
