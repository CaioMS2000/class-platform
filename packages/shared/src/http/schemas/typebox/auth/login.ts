import { Type } from '@sinclair/typebox'
import type { RouteSchemas } from '../types'

const body = Type.Object({
	email: Type.String(),
	password: Type.String(),
})

// Não utiliazdo pois aparentemente não é possível documentar headers de saída, só de entrada.
// const headers = Type.Object({
// 	refresh_token: Type.String(),
// })

const response = {
	200: Type.Object({
		access_token: Type.String(),
	}),
}

export const routeSchemas = {
	body,
	response,
} as const satisfies RouteSchemas
