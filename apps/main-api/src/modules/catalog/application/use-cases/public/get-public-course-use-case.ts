import { type Result, UniqueId, UseCase, success, failure } from '@repo/core'
import { Course } from '../../../domain/entities/course'
import { CourseRepository } from '../../repositories/course-repository'
import { CourseNotFoundError } from '../../@errors'

export type GetPublicCourseUseCaseRequest = {
	courseId: string
}

export type GetPublicCourseUseCaseResponse = Result<
	CourseNotFoundError,
	{ course: Course }
>

type UseCaseProps = {
	courseRepository: CourseRepository
}

export class GetPublicCourseUseCase extends UseCase<
	GetPublicCourseUseCaseRequest,
	GetPublicCourseUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetPublicCourseUseCaseRequest
	): Promise<GetPublicCourseUseCaseResponse> {
		const course = await this.props.courseRepository.findById(
			UniqueId(input.courseId)
		)

		if (!course || course.status !== 'published') {
			return failure(new CourseNotFoundError())
		}

		return success({ course })
	}
}
