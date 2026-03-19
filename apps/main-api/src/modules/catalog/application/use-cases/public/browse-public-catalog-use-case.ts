import { type Result, UseCase, success } from '@repo/core'
import { Course } from '../../../domain/entities/course'
import {
	CourseRepository,
	type CourseFilters,
} from '../../repositories/course-repository'
import type { Pagination } from '../../repositories/params'

export type BrowsePublicCatalogUseCaseRequest = {
	filters?: Omit<CourseFilters, 'status'>
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
			{ ...input.filters, status: 'published' },
			input.pagination
		)

		return success({ courses })
	}
}
