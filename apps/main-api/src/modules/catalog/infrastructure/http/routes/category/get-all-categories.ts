import { Class } from '@repo/core'
import { routeSchemas as allCategoriesRouteSchemas } from '@repo/shared/http/schemas/typebox/catalog-routes/get-all-categories'
import { Elysia } from 'elysia'
import type { GetAllCategoriesUseCase } from '@/modules/catalog/application/use-cases'

type GetAllCategoriesRouteProps = {
	getAllCategoriesUseCase: GetAllCategoriesUseCase
}

export class GetAllCategoriesRoute extends Class<GetAllCategoriesRouteProps> {
	constructor(protected override props: GetAllCategoriesRouteProps) {
		super()
	}

	getRoute() {
		return new Elysia().get(
			'/all',
			async () => {
				const result = await this.props.getAllCategoriesUseCase.execute()

				return result.value.categories
			},
			{
				detail: {
					summary: 'Buscar todas as categorias.',
					tags: ['Category'],
					responses: { ...allCategoriesRouteSchemas.detailResponses },
				},
				response: { ...allCategoriesRouteSchemas.response },
			}
		)
	}
}
