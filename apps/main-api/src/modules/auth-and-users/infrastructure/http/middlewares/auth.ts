import { createMiddleware } from 'hono/factory'
import type { HTTPUser } from '@/modules/auth-and-users/domain/models/http-user'
import type { AppEnv } from '../http-server-app'
import { httpUserSchema } from '../validators/user'

export const authMiddleware = createMiddleware<AppEnv>(
	async (context, next) => {
		const jwtService = context.get('jwtService')
		const token = context.req.header('Authorization')?.replace('Bearer ', '')

		if (!token) return context.json({ error: 'Unauthorized' }, 401)

		const payload = await jwtService.verify(token)
		const parseResult = httpUserSchema.safeParse(payload)

		if (!parseResult.success)
			return context.json({ error: 'Unauthorized' }, 401)

		const user: HTTPUser = parseResult.data
		context.set('user', user)

		await next()
	}
)
