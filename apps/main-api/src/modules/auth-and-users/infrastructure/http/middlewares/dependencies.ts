import type { JwtService } from '@/modules/auth-and-users/domain/application/jwt'
import { createMiddleware } from 'hono/factory'

type Params = { jwtService: JwtService }

export function createDependenciesMiddleware({ jwtService }: Params) {
	return createMiddleware(async (c, next) => {
		c.set('jwtService', jwtService)

		await next()
	})
}
