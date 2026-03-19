import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Course } from '../../../domain/entities/course'
import { CourseRepository } from '../../repositories/course-repository'
import { CourseNotFoundError } from '../../@errors'

export type GetCourseUseCaseRequest = {
	courseId: string
}

export type GetCourseUseCaseResponse = Result<
	CourseNotFoundError,
	{
		course: Course
	}
>

type UseCaseProps = {
	courseRepository: CourseRepository
}

export class GetCourseUseCase extends UseCase<
	GetCourseUseCaseRequest,
	GetCourseUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetCourseUseCaseRequest
	): Promise<GetCourseUseCaseResponse> {
		const { courseId } = input

		const course = await this.props.courseRepository.findById(
			UniqueId(courseId)
		)

		if (!course) {
			return failure(new CourseNotFoundError())
		}

		return success({ course })
	}
}
