import { Type } from '@sinclair/typebox'
import type { RouteSchemas } from '../types'

const headers = Type.Object({
	authorization: Type.Optional(Type.String()),
}) satisfies RouteSchemas['headers']

const query = undefined satisfies RouteSchemas['query']
const params = undefined satisfies RouteSchemas['params']
const body = undefined satisfies RouteSchemas['body']
const response = {
		200: Type.Object({
			id: Type.String(),
			email: Type.String(),
			name: Type.String(),
			avatar: Type.Optional(Type.String()),
			status: Type.String(),
		}),
	} satisfies RouteSchemas['response']

export const routeSchemas = {
	headers,
	response,
} as const satisfies RouteSchemas
