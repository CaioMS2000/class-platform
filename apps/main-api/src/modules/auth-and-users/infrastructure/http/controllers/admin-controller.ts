import { z } from '@hono/zod-openapi'
import { Class } from '@repo/core'
import type { GetAdminUseCase } from '@/modules/auth-and-users/domain/application/use-cases'
import { createRoute, httpServerApp } from '../http-server-app'
import { authMiddleware } from '../middlewares/auth'
import { URL_BASE_PATH } from './constants'

type AdminHttpControllerProps = {
	getAdminUseCase: GetAdminUseCase
	// x: X
}

export class AdminHttpController extends Class<AdminHttpControllerProps> {
	constructor(protected override props: AdminHttpControllerProps) {
		super()
	}

	private readonly URL_BASE_PATH = `${URL_BASE_PATH}/admin`

	registerRoutes() {}

	private getMeRoute() {
		const route = createRoute({
			method: 'get',
			path: `${this.URL_BASE_PATH}/me`,
			middleware: [authMiddleware],
			request: {},
			responses: {
				200: {
					description: 'Perfil do admin',
					content: {
						'application/json': {
							schema: z.null(),
						},
					},
				},
			},
		})

		httpServerApp.openapi(route, context => {
			const user = context.get('user')
			return context.json(null, 200)
		})
	}
}
