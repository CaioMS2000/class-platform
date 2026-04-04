import { Type } from '@sinclair/typebox'
import {
	type DetailResponses,
	type RouteSchemas,
	toOpenApiSchema,
} from '../types'
import { categorySchema } from './@types'

const body = Type.Object({
	name: Type.String(),
	description: Type.Optional(Type.String()),
	parentId: Type.Optional(Type.String()),
	icon: Type.Optional(Type.String()),
}) satisfies RouteSchemas['body']

const errorSchema = Type.Object({ error: Type.String() })

const response = {
	201: categorySchema,
	422: errorSchema,
} satisfies RouteSchemas['response']

const detailResponses: DetailResponses = {
	201: {
		description: '',
		content: {
			'application/json': { schema: toOpenApiSchema(categorySchema) },
		},
	},
	422: {
		description: '',
		content: { 'application/json': { schema: toOpenApiSchema(errorSchema) } },
	},
}

export const routeSchemas = {
	body,
	response,
	detailResponses,
} as const satisfies RouteSchemas
