import { z } from '@hono/zod-openapi'
import type { RouteSchemas } from '../types'

const headers = z.object({
	authorization: z.string().openapi({ example: 'Bearer token123' }),
})
export const routeSchemas = {
	headers,
	response: {
		200: z.object({
			id: z.string(),
			email: z.string(),
			name: z.string(),
			avatar: z.string().optional(),
			status: z.string(),
		}),
	},
} as const satisfies RouteSchemas
