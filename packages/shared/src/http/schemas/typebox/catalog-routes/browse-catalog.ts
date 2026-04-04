import { Type } from '@sinclair/typebox'
import {
	type DetailResponses,
	type RouteSchemas,
	toOpenApiSchema,
} from '../types'
import { courseSchema } from './@types'

const query = Type.Object({
	level: Type.Optional(Type.String()),
	categoryId: Type.Optional(Type.String()),
	instructorId: Type.Optional(Type.String()),
	page: Type.Optional(Type.Number()),
	limit: Type.Optional(Type.Number()),
}) satisfies RouteSchemas['query']

const responseSchema = Type.Array(courseSchema, {
	description: 'Lista de cursos',
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
	query,
	response,
	detailResponses,
} as const satisfies RouteSchemas
