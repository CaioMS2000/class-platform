import { Type } from '@sinclair/typebox'
import {
	type DetailResponses,
	type RouteSchemas,
	toOpenApiSchema,
} from '../types'
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
	attachments: Type.Optional(
		Type.Array(attachmentSchema, { description: 'Lista de anexos' })
	),
	videoUrl: Type.Optional(Type.String()),
	article: Type.Optional(Type.String()),
})

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

const errorSchema = Type.Object({ error: Type.String() })

const response = {
	201: lessonSchema,
	404: errorSchema,
} satisfies RouteSchemas['response']

const detailResponses: DetailResponses = {
	201: {
		description: '',
		content: { 'application/json': { schema: toOpenApiSchema(lessonSchema) } },
	},
	404: {
		description: '',
		content: { 'application/json': { schema: toOpenApiSchema(errorSchema) } },
	},
}

export const routeSchemas = {
	body,
	response,
	detailResponses,
} as const satisfies RouteSchemas
