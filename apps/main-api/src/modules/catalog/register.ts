import {
	CreateCategoryUseCase,
	GetAllCategoriesUseCase,
} from './application/use-cases'
import { DrizzleCategoryRepository } from './infrastructure/database/repositories/drizzle-category-repository'
import { CategoryHttpController } from './infrastructure/http/controllers/categories-controller'

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
		categoryHttpController: c
			.asFunction(
				({ getAllCategoriesUseCase, createCategoryUseCase }) =>
					new CategoryHttpController({
						getAllCategoriesUseCase,
						createCategoryUseCase,
					})
			)
			.singleton(),
	})
}
