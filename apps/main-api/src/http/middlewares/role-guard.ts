import { Elysia } from 'elysia'
import { authPlugin } from './auth'

const Roles = ['admin', 'instructor', 'student'] as const
type Role = (typeof Roles)[number]

export const roleGuardPlugin = (role: Role | Role[]) =>
	new Elysia({ name: `role-guard-${role}` })
		.use(authPlugin)
		.onBeforeHandle(({ user, set }) => {
			const allowed = Array.isArray(role) ? role : [role]
			if (!allowed.includes(user.role as Role)) {
				set.status = 401
				return { error: 'Unauthorized' }
			}
		})
