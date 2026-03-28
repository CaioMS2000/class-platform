import { Type } from '@sinclair/typebox'
import type { RouteSchemas } from '../types'

// enum Role { ADMIN = 'ADMIN', INSTRUCTOR = 'INSTRUCTOR', STUDENT = 'STUDENT' }
// const role = Type.Enum(Role)
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
const response = {
	201: Type.Object({
		name: Type.String(),
		email: Type.String(),
		phone: Type.String(),
		role,
	}),
}

export const routeSchemas = {
	body,
	response,
} as const satisfies RouteSchemas
