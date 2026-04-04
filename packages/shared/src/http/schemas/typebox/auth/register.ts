import { Type } from '@sinclair/typebox'
import {
	type DetailResponses,
	type RouteSchemas,
	toOpenApiSchema,
} from '../types'

const role = Type.Union([
	Type.Literal('ADMIN', { title: 'ADMIN' }),
	Type.Literal('INSTRUCTOR', { title: 'INSTRUCTOR' }),
	Type.Literal('STUDENT', { title: 'STUDENT' }),
])

const body = Type.Object({
	email: Type.String(),
	password: Type.String(),
	name: Type.String(),
	phone: Type.String(),
	role,
})

const responseSchema = Type.Object({
	name: Type.String(),
	email: Type.String(),
	phone: Type.String(),
	role,
})

const response = { 201: responseSchema }

const detailResponses: DetailResponses = {
	201: {
		description: '',
		content: {
			'application/json': { schema: toOpenApiSchema(responseSchema) },
		},
	},
}

export const routeSchemas = {
	body,
	response,
	detailResponses,
} as const satisfies RouteSchemas
