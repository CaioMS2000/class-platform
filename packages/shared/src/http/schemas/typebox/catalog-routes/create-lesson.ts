import { Type } from '@sinclair/typebox'
import type { RouteSchemas } from '../types'
import { lessonSchema } from './@types'

const lessonType = Type.Union([
	Type.Literal('video', { title: 'Video' }),
	Type.Literal('article', { title: 'Article' }),
	Type.Literal('quiz', { title: 'Quiz' }),
	Type.Literal('exercise', { title: 'Exercise' }),
])
const attachmentSchema = Type.Object({
	title: Type.String(),
	url: Type.String(),
})
const contentSchema = Type.Object({
	attachments: Type.Optional(Type.Array(attachmentSchema)),
	videoUrl: Type.Optional(Type.String()),
	article: Type.Optional(Type.String()),
})
const headers = undefined satisfies RouteSchemas['headers']
const query = undefined satisfies RouteSchemas['query']
const params = undefined satisfies RouteSchemas['params']
const body = Type.Object({
	moduleId: Type.String(),
	courseId: Type.String(),
	instructorId: Type.String(),
	order: Type.Number(),
	title: Type.String(),
	description: Type.Optional(Type.String()),
	type: lessonType,
	content: contentSchema,
	duration: Type.Number(),
	isFree: Type.Boolean(),
	requiresPrevious: Type.Optional(Type.Boolean()),
}) satisfies RouteSchemas['body']
const response = {
	201: lessonSchema,
	404: Type.Object({ error: Type.String() }),
} satisfies RouteSchemas['response']

export const routeSchemas = {
	// headers,
	// query,
	// params,
	body,
	response,
} as const satisfies RouteSchemas
