import { t } from 'elysia'

export const httpUserSchema = t.Object({
	id: t.String(),
	name: t.String(),
	email: t.String(),
	role: t.String(),
})
