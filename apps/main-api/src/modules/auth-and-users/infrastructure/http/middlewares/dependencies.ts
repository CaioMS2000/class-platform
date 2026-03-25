import type { JwtService } from '@/modules/auth-and-users/domain/application/jwt'
import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../http-server-app'

type Params = { jwtService: JwtService }

export function createDependenciesMiddleware({ jwtService }: Params) {
	return createMiddleware<AppEnv>(async (c, next) => {
		c.set('jwtService', jwtService)

		await next()
	})
}
