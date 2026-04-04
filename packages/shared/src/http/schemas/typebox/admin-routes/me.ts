import { Type } from '@sinclair/typebox'
import {
	type DetailResponses,
	type RouteSchemas,
	toOpenApiSchema,
} from '../types'

const headers = Type.Object({
	authorization: Type.Optional(Type.String()),
}) satisfies RouteSchemas['headers']

const responseSchema = Type.Object({
	id: Type.String(),
	email: Type.String(),
	name: Type.String(),
	avatar: Type.Optional(Type.String()),
	status: Type.String(),
})

const response = { 200: responseSchema } satisfies RouteSchemas['response']

const detailResponses: DetailResponses = {
	200: {
		description: '',
		content: {
			'application/json': { schema: toOpenApiSchema(responseSchema) },
		},
	},
}

export const routeSchemas = {
	headers,
	response,
	detailResponses,
} as const satisfies RouteSchemas
