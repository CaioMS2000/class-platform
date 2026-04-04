import type { TSchema } from '@sinclair/typebox'
import type { OpenAPIV3 } from 'openapi-types'

/** Valores Typebox em runtime são JSON Schema compatíveis com OpenAPI `SchemaObject`. */
export function toOpenApiSchema(schema: TSchema): OpenAPIV3.SchemaObject {
	return schema as OpenAPIV3.SchemaObject
}

export type RouteSchemas = {
	headers?: TSchema | null
	query?: TSchema | null
	params?: TSchema | null
	body?: TSchema | null
	response?: Record<number, TSchema> | null
	detailResponses?: Record<number, OpenAPIV3.ResponseObject> | null
}

export type DetailResponses = NonNullable<RouteSchemas['detailResponses']>
