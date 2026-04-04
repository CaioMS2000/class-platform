import { Class } from '@repo/core'
import { routeSchemas as meRouteSchemas } from '@repo/shared/http/schemas/typebox/admin-routes/me'
import {
	insufficientPermissionsResponse,
	notFoundResponse,
} from '@repo/shared/http/schemas/typebox/responses'
import { Elysia, status } from 'elysia'
import type { GetAdminUseCase } from '@/modules/auth-and-users/domain/application/use-cases'

type GetAdminMeRouteProps = {
	getAdminUseCase: GetAdminUseCase
}

export class GetAdminMeRoute extends Class<GetAdminMeRouteProps> {
	constructor(protected override props: GetAdminMeRouteProps) {
		super()
	}

	getRoute() {
		return new Elysia().get(
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
				detail: {
					summary: 'Perfil do admin',
					tags: ['Admin'],
					responses: {
						...meRouteSchemas.detailResponses,
						...insufficientPermissionsResponse.detailResponses,
						...notFoundResponse.detailResponses,
					},
				},
				headers: meRouteSchemas.headers,
				response: {
					...meRouteSchemas.response,
					...insufficientPermissionsResponse.response,
					...notFoundResponse.response,
				},
			}
		)
	}
}
