import { Type } from '@sinclair/typebox'
import type { RouteSchemas } from '../types'
import { categorySchema, courseSchema, Currency } from './@types'

enum CourseLevel {
	BEGINNER = 'beginner',
	INTERMEDIATE = 'intermediate',
	ADVANCED = 'advanced',
}
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
		currency: Type.Enum(Currency),
	}),
	promotionalPrice: Type.Optional(
		Type.Object({
			amount: Type.Number(),
			currency: Type.Enum(Currency),
		})
	),
	level: Type.Enum(CourseLevel),
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
