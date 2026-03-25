import { Type } from '@sinclair/typebox'
import type { RouteSchemas } from '../types'

const headers = Type.Object({
	authorization: Type.Optional(Type.String()),
})

export const routeSchemas = {
	headers,
	response: {
		200: Type.Object({
			id: Type.String(),
			email: Type.String(),
			name: Type.String(),
			avatar: Type.Optional(Type.String()),
			status: Type.String(),
		}),
	},
} as const satisfies RouteSchemas
