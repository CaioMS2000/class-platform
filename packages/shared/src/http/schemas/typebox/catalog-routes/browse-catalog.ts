import { Type } from '@sinclair/typebox'
import type { RouteSchemas } from '../types'
import { courseSchema } from './@types'

const headers = undefined satisfies RouteSchemas['headers']
const query = Type.Object({
	level: Type.Optional(Type.String()),
	categoryId: Type.Optional(Type.String()),
	instructorId: Type.Optional(Type.String()),
	page: Type.Optional(Type.Number()),
	limit: Type.Optional(Type.Number()),
}) satisfies RouteSchemas['query']
const params = undefined satisfies RouteSchemas['params']
const body = undefined satisfies RouteSchemas['body']
const response = {
	200: Type.Array(courseSchema, { description: 'Lista de cursos' }),
} satisfies RouteSchemas['response']

export const routeSchemas = {
	// headers,
	query,
	// params,
	// body,
	response,
} as const satisfies RouteSchemas
