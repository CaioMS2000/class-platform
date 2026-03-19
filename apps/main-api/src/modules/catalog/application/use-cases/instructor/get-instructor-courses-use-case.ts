import { type Result, UniqueId, UseCase, success } from '@repo/core'
import { Course } from '../../../domain/entities/course'
import {
	CourseRepository,
	type CourseFilters,
} from '../../repositories/course-repository'
import type { Pagination } from '../../repositories/params'

export type GetInstructorCoursesUseCaseRequest = {
	instructorId: string
	filters?: Omit<CourseFilters, 'instructorId'>
	pagination?: Pagination
}

export type GetInstructorCoursesUseCaseResponse = Result<
	never,
	{ courses: Course[] }
>

type UseCaseProps = {
	courseRepository: CourseRepository
}

export class GetInstructorCoursesUseCase extends UseCase<
	GetInstructorCoursesUseCaseRequest,
	GetInstructorCoursesUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetInstructorCoursesUseCaseRequest
	): Promise<GetInstructorCoursesUseCaseResponse> {
		const courses = await this.props.courseRepository.findMany(
			{ ...input.filters, instructorId: UniqueId(input.instructorId) },
			input.pagination
		)

		return success({ courses })
	}
}
