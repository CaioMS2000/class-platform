import { Type } from '@sinclair/typebox'
import {
	type DetailResponses,
	type RouteSchemas,
	toOpenApiSchema,
} from '../types'
import { categorySchema } from './@types'

const responseSchema = Type.Array(categorySchema, {
	description: 'Lista de categorias',
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
	response,
	detailResponses,
} as const satisfies RouteSchemas
