import type { TSchema } from '@sinclair/typebox'

export type RouteSchemas = {
	headers?: TSchema | null
	query?: TSchema | null
	params?: TSchema | null
	body?: TSchema | null
	response?: Record<string | number, TSchema> | null
}
