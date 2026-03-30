import { Class } from '@repo/core'
import { routeSchemas as meRouteSchemas } from '@repo/shared/http/schemas/typebox/admin-routes/me'
import {
	notFoundResponse,
	unauthorizedResponse,
} from '@repo/shared/http/schemas/typebox/responses'
import { Elysia, status } from 'elysia'
import type { GetAdminUseCase } from '@/modules/auth-and-users/domain/application/use-cases'
import { BASE_URL } from '@/http/constants'
import { authPlugin } from '@/http/middlewares/auth'
import { roleGuardPlugin } from '@/http/middlewares/role-guard'

type AdminHttpControllerProps = {
	getAdminUseCase: GetAdminUseCase
}

export class AdminHttpController extends Class<AdminHttpControllerProps> {
	constructor(protected override props: AdminHttpControllerProps) {
		super()
	}

	readonly tags: string[] = ['Admin']
	readonly BASE_URL = `${BASE_URL}/admin`
	readonly Elysia = new Elysia({ prefix: this.BASE_URL })
		.use(authPlugin)
		.use(roleGuardPlugin('admin'))

	getRouter() {
		return [this.registerMeRoute(), this.Elysia].filter(
			instance => instance instanceof Elysia
		)
	}

	private registerMeRoute() {
		this.Elysia.get(
			'/me',
			async ({ user }) => {
				const result = await this.props.getAdminUseCase.execute({
					adminId: user.id,
				})

				if (result.isFailure())
					return status(404, { error: 'Admin não encontrado' })

				return result.value.admin
			},
			{
				detail: { summary: 'Perfil do admin', tags: [...this.tags] },
				headers: meRouteSchemas.headers,
				response: {
					...meRouteSchemas.response,
					...unauthorizedResponse,
					...notFoundResponse,
				},
			}
		)
	}
}
