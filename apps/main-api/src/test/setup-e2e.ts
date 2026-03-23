import { config } from 'dotenv'
import { randomBytes } from 'node:crypto'
import { execSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import pg from 'pg'
import { afterAll } from 'bun:test'

process.env.NODE_ENV = 'test'

// Load .env first to get JWT keys and other vars
config({ path: '.env', override: false })
// Then load .env.test to override DATABASE_URL for tests
config({ path: '.env.test', override: true })

const schemaId = `test_${randomBytes(8).toString('hex')}`
const baseDatabaseUrl = process.env.DATABASE_URL!

const client = new pg.Client({ connectionString: baseDatabaseUrl })
await client.connect()

try {
	await client.query(`CREATE SCHEMA "${schemaId}"`)
	await client.query(`SET search_path TO "${schemaId}"`)

	execSync('bunx drizzle-kit generate', {
		cwd: process.cwd(),
		stdio: 'pipe',
	})

	const migrationsDir = join(process.cwd(), 'drizzle')
	const sqlFiles = readdirSync(migrationsDir)
		.filter(f => f.endsWith('.sql'))
		.sort()

	for (const file of sqlFiles) {
		let sql = readFileSync(join(migrationsDir, file), 'utf-8')
		sql = sql.replaceAll('"public".', '')
		sql = sql.replaceAll('--> statement-breakpoint', '')
		await client.query(sql)
	}
} finally {
	await client.end()
}

const separator = baseDatabaseUrl.includes('?') ? '&' : '?'
process.env.DATABASE_URL = `${baseDatabaseUrl}${separator}options=-c%20search_path%3D${schemaId}`

console.log(`\n[e2e] Schema "${schemaId}" created`)

afterAll(async () => {
	const { drizzle } = await import('@/lib/drizzle')
	await drizzle.$client.end()

	const teardownClient = new pg.Client({ connectionString: baseDatabaseUrl })
	await teardownClient.connect()
	try {
		await teardownClient.query(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
	} finally {
		await teardownClient.end()
	}

	console.log(`[e2e] Schema "${schemaId}" dropped\n`)
})
