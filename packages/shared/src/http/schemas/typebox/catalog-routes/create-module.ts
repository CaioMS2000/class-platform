import { Type } from '@sinclair/typebox'
import type { RouteSchemas } from '../types'
import { moduleSchema } from './@types'

const headers = undefined satisfies RouteSchemas['headers']
const query = undefined satisfies RouteSchemas['query']
const params = undefined satisfies RouteSchemas['params']
const body = Type.Object({
	courseId: Type.String(),
	instructorId: Type.String(),
	title: Type.String(),
	description: Type.Optional(Type.String()),
	order: Type.Number(),
}) satisfies RouteSchemas['body']
const response = {
	201: moduleSchema,
	404: Type.Object({ error: Type.String() }),
} satisfies RouteSchemas['response']

export const routeSchemas = {
	// headers,
	// query,
	// params,
	body,
	response,
} as const satisfies RouteSchemas
