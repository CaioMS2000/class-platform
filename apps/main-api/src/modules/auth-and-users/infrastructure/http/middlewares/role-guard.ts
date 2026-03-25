import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../http-server-app'

const Roles = ['admin', 'instructor', 'student'] as const
type Roles = (typeof Roles)[number]

export const roleGuardMiddleware = (role: Roles | Roles[]) =>
	createMiddleware<AppEnv>(async (context, next) => {
		const currentUserRole = context.get('user').role

		if (typeof role === 'string' && role !== currentUserRole) {
			return context.json({ error: 'Unauthorized' }, 401)
		}
		if (Array.isArray(role)) {
			if (!role.includes(currentUserRole as Roles)) {
				return context.json({ error: 'Unauthorized' }, 401)
			}
		}

		await next()
	})
