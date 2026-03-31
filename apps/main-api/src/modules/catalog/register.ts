import {
	BrowsePublicCatalogUseCase,
	CreateCategoryUseCase,
	GetAllCategoriesUseCase,
} from './application/use-cases'
import { DrizzleCategoryRepository } from './infrastructure/database/repositories/drizzle-category-repository'
import { DrizzleCourseRepository } from './infrastructure/database/repositories/drizzle-course-repository'
import { CategoryRouter } from './infrastructure/http/routes/category/router'
import { CourseRouter } from './infrastructure/http/routes/course/router'

export function registerCatalogModule(c: typeof container) {
	// Repositories
	c.register({
		categoryRepository: c
			.asFunction(() => new DrizzleCategoryRepository())
			.singleton(),
		catalogCourseRepository: c
			.asFunction(() => new DrizzleCourseRepository())
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
		browsePublicCatalogUseCase: c
			.asFunction(
				({ catalogCourseRepository }) =>
					new BrowsePublicCatalogUseCase({
						courseRepository: catalogCourseRepository,
					})
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
		courseRouter: c
			.asFunction(
				({ browsePublicCatalogUseCase }) =>
					new CourseRouter({
						browsePublicCatalogUseCase,
					})
			)
			.singleton(),
	})
}
