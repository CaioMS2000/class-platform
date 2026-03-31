import { Type } from '@sinclair/typebox'
import type { RouteSchemas } from '../types'
import { categorySchema } from './@types'

const headers = undefined satisfies RouteSchemas['headers']
const query = undefined satisfies RouteSchemas['query']
const params = undefined satisfies RouteSchemas['params']
const body = undefined satisfies RouteSchemas['body']
const response = {
    200: Type.Array(categorySchema)
} satisfies RouteSchemas['response']

export const routeSchemas = {
    // headers,
    // query,
    // params,
    // body,
    response
} as const satisfies RouteSchemas