import { config } from 'dotenv'
import { execSync } from 'node:child_process'
import { afterAll } from 'bun:test'

process.env.NODE_ENV = 'test'

config({ path: '.env', override: false })
config({ path: '.env.test', override: true })

execSync('bunx drizzle-kit generate', {
	cwd: process.cwd(),
	stdio: 'pipe',
})

afterAll(async () => {
	const { drizzle } = await import('@/lib/drizzle')
	await drizzle.$client.end()
})
