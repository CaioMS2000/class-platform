import { Type } from '@sinclair/typebox'

export const currency = Type.Union([
	Type.Literal('USD', { title: 'USD' }),
	Type.Literal('BRL', { title: 'BRL' }),
])

export const categorySchema = Type.Object({
	id: Type.String(),
	name: Type.String(),
	slug: Type.String(),
	description: Type.Optional(Type.String()),
	icon: Type.Optional(Type.String()),
})

export const courseSchema = Type.Object({
	id: Type.String(),
	slug: Type.String(),
	title: Type.String(),
	subtitle: Type.Optional(Type.String()),
	description: Type.String(),
	thumbnail: Type.String(),
	coverImage: Type.Optional(Type.String()),
})

export const moduleSchema = Type.Object({
	id: Type.String(),
	courseId: Type.String(),
	order: Type.Number(),
	title: Type.String(),
	description: Type.Optional(Type.String()),
})

export const lessonSchema = Type.Object({
	id: Type.String(),
	moduleId: Type.String(),
	courseId: Type.String(),
	order: Type.Number(),
	title: Type.String(),
	description: Type.Optional(Type.String()),
	type: Type.String(),
	duration: Type.Number(),
	isFree: Type.Boolean(),
	requiresPrevious: Type.Boolean(),
})
