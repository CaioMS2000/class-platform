import { Type } from '@sinclair/typebox'
import {
	type DetailResponses,
	type RouteSchemas,
	toOpenApiSchema,
} from '../types'
import { moduleSchema } from './@types'

const body = Type.Object({
	courseId: Type.String(),
	instructorId: Type.String(),
	title: Type.String(),
	description: Type.Optional(Type.String()),
	order: Type.Number(),
}) satisfies RouteSchemas['body']

const errorSchema = Type.Object({ error: Type.String() })

const response = {
	201: moduleSchema,
	404: errorSchema,
} satisfies RouteSchemas['response']

const detailResponses: DetailResponses = {
	201: {
		description: '',
		content: { 'application/json': { schema: toOpenApiSchema(moduleSchema) } },
	},
	404: {
		description: '',
		content: { 'application/json': { schema: toOpenApiSchema(errorSchema) } },
	},
}

export const routeSchemas = {
	body,
	response,
	detailResponses,
} as const satisfies RouteSchemas
