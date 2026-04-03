import { Type } from '@sinclair/typebox'
import type { RouteSchemas } from '../types'
import { courseSchema, currency } from './@types'

const courseLevel = Type.Union([
	Type.Literal('beginner', { title: 'beginner' }),
	Type.Literal('intermediate', { title: 'intermediate' }),
	Type.Literal('advanced', { title: 'advanced' }),
])
const headers = undefined satisfies RouteSchemas['headers']
const query = undefined satisfies RouteSchemas['query']
const params = undefined satisfies RouteSchemas['params']
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
	categoryIds: Type.Optional(Type.Array(Type.String())),
}) satisfies RouteSchemas['body']
const response = {
	201: courseSchema,
	404: Type.Object({ error: Type.String() }),
} satisfies RouteSchemas['response']

export const routeSchemas = {
	// headers,
	// query,
	// params,
	body,
	response,
} as const satisfies RouteSchemas
