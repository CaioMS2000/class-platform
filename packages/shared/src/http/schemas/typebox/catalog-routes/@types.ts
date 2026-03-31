import { Type } from '@sinclair/typebox'

export const categorySchema = Type.Object({
	id: Type.String(),
	name: Type.String(),
	slug: Type.String(),
	description: Type.Optional(Type.String()),
	icon: Type.Optional(Type.String()),
})