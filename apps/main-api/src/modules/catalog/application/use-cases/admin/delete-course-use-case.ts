import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { CourseRepository } from '../../repositories/course-repository'
import { CourseNotFoundError } from '../../@errors'

export type DeleteCourseUseCaseRequest = {
	courseId: string
}

export type DeleteCourseUseCaseResponse = Result<CourseNotFoundError, null>

type UseCaseProps = {
	courseRepository: CourseRepository
}

export class DeleteCourseUseCase extends UseCase<
	DeleteCourseUseCaseRequest,
	DeleteCourseUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: DeleteCourseUseCaseRequest
	): Promise<DeleteCourseUseCaseResponse> {
		const { courseId } = input

		const course = await this.props.courseRepository.findById(
			UniqueId(courseId)
		)

		if (!course) {
			return failure(new CourseNotFoundError())
		}

		await this.props.courseRepository.delete(course)

		return success(null)
	}
}
