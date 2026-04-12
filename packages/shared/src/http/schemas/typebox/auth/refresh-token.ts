import { Type } from '@sinclair/typebox'
import {
	type DetailResponses,
	type RouteSchemas,
	toOpenApiSchema,
} from '../types'

const responseSchema = Type.Object({
	access_token: Type.String(),
})

const response = { 200: responseSchema }

const detailResponses: DetailResponses = {
	200: {
		description: '',
		content: {
			'application/json': { schema: toOpenApiSchema(responseSchema) },
		},
	},
}

export const routeSchemas = {
	response,
	detailResponses,
} as const satisfies RouteSchemas
