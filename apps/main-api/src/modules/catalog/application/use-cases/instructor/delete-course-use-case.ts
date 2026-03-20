import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { CourseRepository } from '../../repositories/course-repository'
import { CourseNotFoundError, NotCourseOwnerError } from '../../@errors'

export type InstructorDeleteCourseUseCaseRequest = {
	courseId: string
	instructorId: string
}

export type InstructorDeleteCourseUseCaseResponse = Result<
	CourseNotFoundError | NotCourseOwnerError,
	null
>

type UseCaseProps = {
	courseRepository: CourseRepository
}

export class InstructorDeleteCourseUseCase extends UseCase<
	InstructorDeleteCourseUseCaseRequest,
	InstructorDeleteCourseUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: InstructorDeleteCourseUseCaseRequest
	): Promise<InstructorDeleteCourseUseCaseResponse> {
		const { courseId, instructorId } = input

		const course = await this.props.courseRepository.findById(
			UniqueId(courseId)
		)

		if (!course) {
			return failure(new CourseNotFoundError())
		}

		if (course.instructorId !== UniqueId(instructorId)) {
			return failure(new NotCourseOwnerError())
		}

		await this.props.courseRepository.delete(course)

		return success(null)
	}
}
