import { Type } from '@sinclair/typebox'
import type { OpenAPIV3 } from 'openapi-types'
import { toOpenApiSchema } from './types'

const errorSchema = Type.Object({ error: Type.String() })

const jsonError = {
	description: '',
	content: {
		'application/json': { schema: toOpenApiSchema(errorSchema) },
	},
} satisfies OpenAPIV3.ResponseObject

export const insufficientPermissionsResponse = {
	response: { 403: errorSchema },
	detailResponses: { 403: jsonError },
} as const

export const notFoundResponse = {
	response: { 404: errorSchema },
	detailResponses: { 404: jsonError },
} as const

export const serverErrorResponse = {
	response: { 500: errorSchema },
	detailResponses: { 500: jsonError },
} as const
