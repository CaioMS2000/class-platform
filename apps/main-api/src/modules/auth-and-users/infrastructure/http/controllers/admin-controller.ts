import { Class } from '@repo/core'
import { routeSchemas as meRouteSchemas } from '@repo/shared/http/schemas/zod/admin-routes/me'
import {
	unauthorizedResponse,
	notFoundResponse,
} from '@repo/shared/http/responses/index'
import type { GetAdminUseCase } from '@/modules/auth-and-users/domain/application/use-cases'
import { createRoute, httpServerApp } from '../http-server-app'
import { authMiddleware } from '../middlewares/auth'
import { URL_BASE_PATH } from './constants'
import { roleGuardMiddleware } from '../middlewares/role-guard'

type AdminHttpControllerProps = {
	getAdminUseCase: GetAdminUseCase
	// x: X
}

export class AdminHttpController extends Class<AdminHttpControllerProps> {
	constructor(protected override props: AdminHttpControllerProps) {
		super()
	}

	private readonly URL_BASE_PATH = `${URL_BASE_PATH}/admin`

	registerRoutes() {
		this.getMeRoute()
	}

	private getMeRoute() {
		const route = createRoute({
			method: 'get',
			path: `${this.URL_BASE_PATH}/me`,
			middleware: [authMiddleware, roleGuardMiddleware('admin')],
			request: {
				headers: meRouteSchemas.headers,
			},
			responses: {
				...unauthorizedResponse,
				...notFoundResponse('Admin não encontrado'),
				200: {
					description: 'Perfil do admin',
					content: {
						'application/json': {
							schema: meRouteSchemas.response[200],
						},
					},
				},
			},
		})

		httpServerApp.openapi(route, async context => {
			const user = context.get('user')
			const getAdminResult = await this.props.getAdminUseCase.execute({
				adminId: user.id,
			})

			if (getAdminResult.isFailure()) return context.json(null, 404)

			return context.json(getAdminResult.value.admin, 200)
		})
	}
}
