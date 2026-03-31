import { Type } from '@sinclair/typebox'
import type { RouteSchemas } from '../types'
import { categorySchema } from './@types'

const headers = undefined satisfies RouteSchemas['headers']
const query = undefined satisfies RouteSchemas['query']
const params = undefined satisfies RouteSchemas['params']
const body = Type.Object({
	name: Type.String(),
	description: Type.Optional(Type.String()),
	parentId: Type.Optional(Type.String()),
	icon: Type.Optional(Type.String()),
}) satisfies RouteSchemas['body']
const response = {
	201: categorySchema,
	422: Type.Object({ error: Type.String() }),
} satisfies RouteSchemas['response']

export const routeSchemas = {
	// headers,
	// query,
	// params,
	body,
	response,
} as const satisfies RouteSchemas
