import { Class } from '@repo/core'
import { routeSchemas as createCategoryRouteSchemas } from '@repo/shared/http/schemas/typebox/catalog-routes/create-category'
import { insufficientPermissionsResponse } from '@repo/shared/http/schemas/typebox/responses'
import { Elysia, status } from 'elysia'
import type { CreateCategoryUseCase } from '@/modules/catalog/application/use-cases'

type CreateCategoryRouteProps = {
	createCategoryUseCase: CreateCategoryUseCase
}

export class CreateCategoryRoute extends Class<CreateCategoryRouteProps> {
	constructor(protected override props: CreateCategoryRouteProps) {
		super()
	}

	getRoute() {
		return new Elysia().post(
			'',
			async ({ body }) => {
				const result = await this.props.createCategoryUseCase.execute(body)

				if (result.isFailure())
					return status(422, { error: result.value.message })

				return status(201, result.value.category)
			},
			{
				detail: { summary: 'Criar uma nova categoria.', tags: ['Category'] },
				response: {
					...createCategoryRouteSchemas.response,
					...insufficientPermissionsResponse,
				},
				body: createCategoryRouteSchemas.body,
			}
		)
	}
}
