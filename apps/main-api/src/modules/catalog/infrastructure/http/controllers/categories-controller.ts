import { Class } from '@repo/core'
import { routeSchemas as allCategoriesRouteSchemas } from '@repo/shared/http/schemas/typebox/catalog-routes/get-all-categories'
import { routeSchemas as createCategoryRouteSchemas } from '@repo/shared/http/schemas/typebox/catalog-routes/create-category'
import { Elysia, status } from 'elysia'
import { BASE_URL } from '@/http/constants'
import { authPlugin } from '@/http/middlewares/auth'
import { roleGuardPlugin } from '@/http/middlewares/role-guard'
import type {
	CreateCategoryUseCase,
	GetAllCategoriesUseCase,
} from '@/modules/catalog/application/use-cases'
import { insufficientPermissionsResponse } from '@repo/shared/http/schemas/typebox/responses'

type CategoryHttpControllerProps = {
	getAllCategoriesUseCase: GetAllCategoriesUseCase
	createCategoryUseCase: CreateCategoryUseCase
}

export class CategoryHttpController extends Class<CategoryHttpControllerProps> {
	constructor(protected override props: CategoryHttpControllerProps) {
		super()
	}

	readonly tags: string[] = ['Category']
	readonly BASE_URL = `${BASE_URL}/category`
	readonly Elysia = new Elysia({ prefix: this.BASE_URL })
		.use(authPlugin)
		.use(roleGuardPlugin(['admin']))

	getRouter() {
		return [
			this.registerGetAllCategoriesRoute(),
			this.registerCreateCategoryRoute(),
			this.Elysia,
		].filter(instance => instance instanceof Elysia)
	}

	private registerGetAllCategoriesRoute() {
		return new Elysia({ prefix: this.BASE_URL }).get(
			'/all',
			async () => {
				const result = await this.props.getAllCategoriesUseCase.execute()

				return result.value.categories
			},
			{
				detail: {
					summary: 'Buscar todas as categorias.',
					tags: [...this.tags],
				},
				response: {
					...allCategoriesRouteSchemas.response,
				},
			}
		)
	}

	private registerCreateCategoryRoute() {
		this.Elysia.post(
			'',
			async ({ body }) => {
				const result = await this.props.createCategoryUseCase.execute(body)

				if (result.isFailure())
					return status(422, { error: result.value.message })

				return status(201, result.value.category)
			},
			{
				detail: { summary: 'Criar uma nova categoria.', tags: [...this.tags] },
				response: {
					...createCategoryRouteSchemas.response,
					...insufficientPermissionsResponse,
				},
				body: createCategoryRouteSchemas.body,
			}
		)
	}
}
