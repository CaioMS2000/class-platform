import { randomBytes } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import pg from 'pg'

let schemaId: string

export async function setupSchema() {
	schemaId = `test_${randomBytes(8).toString('hex')}`
	const baseDatabaseUrl = process.env.DATABASE_URL!

	const client = new pg.Client({ connectionString: baseDatabaseUrl })
	await client.connect()

	try {
		await client.query(`CREATE SCHEMA "${schemaId}"`)
		await client.query(`SET search_path TO "${schemaId}"`)

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

	const { drizzle } = await import('@/lib/drizzle')
	await drizzle.$client.query(`SET search_path TO "${schemaId}"`)

	console.log(`[integration] Schema "${schemaId}" created`)
}

export async function teardownSchema() {
	const baseDatabaseUrl = process.env.DATABASE_URL!

	const client = new pg.Client({ connectionString: baseDatabaseUrl })
	await client.connect()
	try {
		await client.query(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
	} finally {
		await client.end()
	}

	console.log(`[integration] Schema "${schemaId}" dropped`)
}
