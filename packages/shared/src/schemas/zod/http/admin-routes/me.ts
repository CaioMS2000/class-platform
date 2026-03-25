import { z } from '@hono/zod-openapi'
import type { RouteSchemas } from '../types'

const headers = z.object({
	authorization: z.string().openapi({ example: 'Bearer token123' }),
})
export const routeSchemas = {
	headers,
} as const satisfies RouteSchemas
