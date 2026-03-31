import {
	CreateCategoryUseCase,
	GetAllCategoriesUseCase,
} from './application/use-cases'
import { DrizzleCategoryRepository } from './infrastructure/database/repositories/drizzle-category-repository'
import { CategoryRouter } from './infrastructure/http/routes/category/router'

export function registerCatalogModule(c: typeof container) {
	// Repositories
	c.register({
		categoryRepository: c
			.asFunction(() => new DrizzleCategoryRepository())
			.singleton(),
	})

	// Use cases
	c.register({
		getAllCategoriesUseCase: c
			.asFunction(
				({ categoryRepository }) =>
					new GetAllCategoriesUseCase({ categoryRepository })
			)
			.singleton(),
		createCategoryUseCase: c
			.asFunction(
				({ categoryRepository, idGenerator }) =>
					new CreateCategoryUseCase({ categoryRepository, idGenerator })
			)
			.singleton(),
	})

	// Infrastructure
	c.register({
		categoryRouter: c
			.asFunction(
				({ getAllCategoriesUseCase, createCategoryUseCase }) =>
					new CategoryRouter({
						getAllCategoriesUseCase,
						createCategoryUseCase,
					})
			)
			.singleton(),
	})
}
