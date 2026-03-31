import { Type } from '@sinclair/typebox'

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
