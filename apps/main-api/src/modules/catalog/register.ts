import {
	BrowsePublicCatalogUseCase,
	CreateCategoryUseCase,
	GetAllCategoriesUseCase,
	InstructorCreateCourseUseCase,
	InstructorCreateModuleUseCase,
	InstructorCreateLessonUseCase,
} from './application/use-cases'
import { DrizzleCategoryRepository } from './infrastructure/database/repositories/drizzle-category-repository'
import { DrizzleCourseRepository } from './infrastructure/database/repositories/drizzle-course-repository'
import { DrizzleModuleRepository } from './infrastructure/database/repositories/drizzle-module-repository'
import { DrizzleLessonRepository } from './infrastructure/database/repositories/drizzle-lesson-repository'
import { CategoryRouter } from './infrastructure/http/routes/category/router'
import { CourseRouter } from './infrastructure/http/routes/course/router'
import { InstructorRouter } from './infrastructure/http/routes/instructor/router'

export function registerCatalogModule(c: typeof container) {
	// Repositories
	c.register({
		categoryRepository: c
			.asFunction(() => new DrizzleCategoryRepository())
			.singleton(),
		catalogCourseRepository: c
			.asFunction(() => new DrizzleCourseRepository())
			.singleton(),
		moduleRepository: c
			.asFunction(() => new DrizzleModuleRepository())
			.singleton(),
		lessonRepository: c
			.asFunction(() => new DrizzleLessonRepository())
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
		createCourseUseCase: c
			.asFunction(
				({ catalogCourseRepository, categoryRepository, idGenerator }) =>
					new InstructorCreateCourseUseCase({
						courseRepository: catalogCourseRepository,
						categoryRepository,
						idGenerator,
					})
			)
			.singleton(),
		createModuleUseCase: c
			.asFunction(
				({ catalogCourseRepository, moduleRepository, idGenerator }) =>
					new InstructorCreateModuleUseCase({
						courseRepository: catalogCourseRepository,
						moduleRepository,
						idGenerator,
					})
			)
			.singleton(),
		createLessonUseCase: c
			.asFunction(
				({
					catalogCourseRepository,
					moduleRepository,
					lessonRepository,
					idGenerator,
				}) =>
					new InstructorCreateLessonUseCase({
						courseRepository: catalogCourseRepository,
						moduleRepository,
						lessonRepository,
						idGenerator,
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
		instructorRouter: c
			.asFunction(
				({ createCourseUseCase, createModuleUseCase, createLessonUseCase }) =>
					new InstructorRouter({
						createCourseUseCase,
						createModuleUseCase,
						createLessonUseCase,
					})
			)
			.singleton(),
	})
}
