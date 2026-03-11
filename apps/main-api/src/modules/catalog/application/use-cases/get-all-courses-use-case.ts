import { Result, UseCase, success } from '@repo/core'
import { Course } from '../../domain/entities/course'
import {
	CourseRepository,
	CourseFilters,
} from '../repositories/course-repository'
import { Pagination } from '../repositories/params'

export type GetAllCoursesUseCaseRequest = {
	filters?: CourseFilters
	pagination?: Pagination
}

export type GetAllCoursesUseCaseResponse = Result<
	never,
	{
		courses: Course[]
	}
>

type UseCaseProps = {
	courseRepository: CourseRepository
}

export class GetAllCoursesUseCase extends UseCase<
	GetAllCoursesUseCaseRequest,
	GetAllCoursesUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetAllCoursesUseCaseRequest
	): Promise<GetAllCoursesUseCaseResponse> {
		const { filters, pagination } = input

		const courses = await this.props.courseRepository.findMany(
			filters,
			pagination
		)

		return success({ courses })
	}
}
