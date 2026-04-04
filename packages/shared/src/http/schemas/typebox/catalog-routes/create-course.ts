import { Type } from '@sinclair/typebox'
import {
	type DetailResponses,
	type RouteSchemas,
	toOpenApiSchema,
} from '../types'
import { courseSchema, currency } from './@types'

const courseLevel = Type.Union([
	Type.Literal('beginner', { title: 'beginner' }),
	Type.Literal('intermediate', { title: 'intermediate' }),
	Type.Literal('advanced', { title: 'advanced' }),
])

const body = Type.Object({
	instructorId: Type.String(),
	title: Type.String(),
	subtitle: Type.Optional(Type.String()),
	description: Type.String(),
	price: Type.Object({
		amount: Type.Number(),
		currency: currency,
	}),
	promotionalPrice: Type.Optional(
		Type.Object({
			amount: Type.Number(),
			currency: currency,
		})
	),
	level: courseLevel,
	thumbnail: Type.String(),
	categoryIds: Type.Optional(
		Type.Array(Type.String(), { description: 'Lista de categorias' })
	),
}) satisfies RouteSchemas['body']

const errorSchema = Type.Object({ error: Type.String() })

const response = {
	201: courseSchema,
	404: errorSchema,
} satisfies RouteSchemas['response']

const detailResponses: DetailResponses = {
	201: {
		description: '',
		content: { 'application/json': { schema: toOpenApiSchema(courseSchema) } },
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
