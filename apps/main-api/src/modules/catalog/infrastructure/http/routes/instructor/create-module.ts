import { Class } from '@repo/core'
import { routeSchemas } from '@repo/shared/http/schemas/typebox/catalog-routes/create-module'
import { insufficientPermissionsResponse } from '@repo/shared/http/schemas/typebox/responses'
import { Elysia, status } from 'elysia'
import type { InstructorCreateModuleUseCase } from '@/modules/catalog/application/use-cases'
import { mapErrorToHttp } from '@/modules/catalog/infrastructure/http/map-error-to-http'

type CreateModuleRouteProps = {
	createModuleUseCase: InstructorCreateModuleUseCase
}

export class CreateModuleRoute extends Class<CreateModuleRouteProps> {
	constructor(protected override props: CreateModuleRouteProps) {
		super()
	}

	getRoute() {
		return new Elysia().post(
			'new-module',
			async ({ body }) => {
				const result = await this.props.createModuleUseCase.execute({
					...body,
				})

				if (result.isFailure()) return mapErrorToHttp(result.value)

				return status(201, result.value.module)
			},
			{
				detail: { summary: 'Criar um novo módulo.', tags: ['Courses'] },
				response: {
					...routeSchemas.response,
					...insufficientPermissionsResponse,
				},
				body: routeSchemas.body,
			}
		)
	}
}
