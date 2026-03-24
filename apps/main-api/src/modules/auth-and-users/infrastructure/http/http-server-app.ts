import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { logger } from 'hono/logger'
import type { JwtService } from '../../domain/application/jwt'
import type { HTTPUser } from '../../domain/models/http-user'

export type AppEnv = {
	Variables: {
		jwtService: JwtService
		user: HTTPUser
	}
}

export const httpServerApp = new OpenAPIHono<AppEnv>()

httpServerApp.use(logger())

export { createRoute }
