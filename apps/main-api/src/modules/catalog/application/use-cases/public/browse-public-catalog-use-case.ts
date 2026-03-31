import { type Result, success, UniqueId, UseCase } from '@repo/core'
import type { Course } from '../../../domain/entities/course'
import type { CourseRepository } from '../../repositories/course-repository'
import type { Pagination } from '../../repositories/params'

type CourseFilters = {
	level?: string
	categoryId?: string
	instructorId?: string
}

export type BrowsePublicCatalogUseCaseRequest = {
	filters?: CourseFilters
	pagination?: Pagination
}

export type BrowsePublicCatalogUseCaseResponse = Result<
	never,
	{ courses: Course[] }
>

type UseCaseProps = {
	courseRepository: CourseRepository
}

export class BrowsePublicCatalogUseCase extends UseCase<
	BrowsePublicCatalogUseCaseRequest,
	BrowsePublicCatalogUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: BrowsePublicCatalogUseCaseRequest
	): Promise<BrowsePublicCatalogUseCaseResponse> {
		const courses = await this.props.courseRepository.findMany(
			{
				...input.filters,
				categoryId: input.filters?.categoryId
					? UniqueId(input.filters?.categoryId)
					: undefined,
				instructorId: input.filters?.instructorId
					? UniqueId(input.filters?.instructorId)
					: undefined,
				status: 'published',
			},
			input.pagination
		)

		return success({ courses })
	}
}
