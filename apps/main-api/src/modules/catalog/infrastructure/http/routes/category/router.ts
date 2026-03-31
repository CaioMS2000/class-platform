import { Class } from '@repo/core'
import { Elysia } from 'elysia'
import type {
	CreateCategoryUseCase,
	GetAllCategoriesUseCase,
} from '@/modules/catalog/application/use-cases'
import { BASE_URL } from '@/http/constants'
import { authPlugin } from '@/http/middlewares/auth'
import { roleGuardPlugin } from '@/http/middlewares/role-guard'
import { GetAllCategoriesRoute } from './get-all-categories'
import { CreateCategoryRoute } from './create-category'

type CategoryRouterProps = {
	getAllCategoriesUseCase: GetAllCategoriesUseCase
	createCategoryUseCase: CreateCategoryUseCase
}

export class CategoryRouter extends Class<CategoryRouterProps> {
	constructor(protected override props: CategoryRouterProps) {
		super()
	}

	private readonly BASE_URL = `${BASE_URL}/category`
	private get Elysia() {
		return new Elysia({ prefix: this.BASE_URL })
	}

	getRouter() {
		const getAllCategories = new GetAllCategoriesRoute({
			getAllCategoriesUseCase: this.props.getAllCategoriesUseCase,
		})
		const createCategory = new CreateCategoryRoute({
			createCategoryUseCase: this.props.createCategoryUseCase,
		})

		// Rotas públicas (sem auth)
		const publicRoutes = this.Elysia.use(getAllCategories.getRoute())

		// Rotas protegidas (com auth)
		const protectedRoutes = this.Elysia.use(authPlugin)
			.use(roleGuardPlugin(['admin']))
			.use(createCategory.getRoute())

		return [publicRoutes, protectedRoutes]
	}
}
