import { Class } from '@repo/core'
import { routeSchemas as meRouteSchemas } from '@repo/shared/http/schemas/typebox/admin-routes/me'
import {
	unauthorizedResponse,
	notFoundResponse,
} from '@repo/shared/http/schemas/typebox/responses/index'
import { Elysia, status, t } from 'elysia'
import type { GetAdminUseCase } from '@/modules/auth-and-users/domain/application/use-cases'
import { authPlugin } from '../middlewares/auth'
import { roleGuardPlugin } from '../middlewares/role-guard'
import { BASE_URL } from '../constants'

type AdminHttpControllerProps = {
	getAdminUseCase: GetAdminUseCase
}

export class AdminHttpController extends Class<AdminHttpControllerProps> {
	constructor(protected override props: AdminHttpControllerProps) {
		super()
	}

	readonly tags: string[] = ['Admin']
	readonly BASE_URL = `${BASE_URL}/admin`

	getRouters() {
		return [this.getMeRouter()]
	}

	private getMeRouter() {
		return new Elysia({ prefix: this.BASE_URL })
			.use(authPlugin)
			.use(roleGuardPlugin('admin'))
			.get(
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
