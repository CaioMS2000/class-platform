import { Class } from '@repo/core'
import { routeSchemas as allCategoriesRouteSchemas } from '@repo/shared/http/schemas/typebox/catalog-routes/get-all-categories'
import { Elysia } from 'elysia'
import { BASE_URL } from '@/http/constants'
import { authPlugin } from '@/http/middlewares/auth'
import { roleGuardPlugin } from '@/http/middlewares/role-guard'
import type { GetAllCategoriesUseCase } from '@/modules/catalog/application/use-cases'

type CategoryHttpControllerProps = {
	getAllCategoriesUseCase: GetAllCategoriesUseCase
}

export class CategoryHttpController extends Class<CategoryHttpControllerProps> {
	constructor(protected override props: CategoryHttpControllerProps) {
		super()
	}

	readonly tags: string[] = ['Category']
	readonly BASE_URL = `${BASE_URL}/category`
	readonly Elysia = new Elysia({ prefix: this.BASE_URL })
		.use(authPlugin)
		.use(roleGuardPlugin(['admin', 'instructor']))

	getRouter() {
		return [this.registerGetAllCategoriesRoute(), this.Elysia].filter(
			instance => instance instanceof Elysia
		)
	}

	private registerGetAllCategoriesRoute() {
		return new Elysia({ prefix: this.BASE_URL }).get(
			'/all',
			async ({}) => {
				const result = await this.props.getAllCategoriesUseCase.execute()

				return result.value.categories
			},
			{
				detail: { summary: 'Buscar todas as categorias.', tags: [...this.tags] },
				response: {
					...allCategoriesRouteSchemas.response,
				},
			}
		)
	}
}
