import { bootstrap } from '@/bootstrap'
import { app } from '@/http/app'
import { initHttpRoutes } from '@/http/server'
import { setupSchema, teardownSchema } from './setup-schema'

let baseUrl: string

export async function setupE2E() {
	await setupSchema()
	bootstrap()
	initHttpRoutes()
	app.listen(0)
	baseUrl = `http://localhost:${app.server!.port}`
}

export async function teardownE2E() {
	app.stop()
	await teardownSchema()
}

export function getBaseUrl() {
	return baseUrl
}
