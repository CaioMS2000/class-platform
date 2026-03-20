import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Course } from '../../../domain/entities/course'
import { CourseRepository } from '../../repositories/course-repository'
import { CourseNotFoundError, NotCourseOwnerError } from '../../@errors'

export type InstructorGetCourseUseCaseRequest = {
	courseId: string
	instructorId: string
}

export type InstructorGetCourseUseCaseResponse = Result<
	CourseNotFoundError | NotCourseOwnerError,
	{
		course: Course
	}
>

type UseCaseProps = {
	courseRepository: CourseRepository
}

export class InstructorGetCourseUseCase extends UseCase<
	InstructorGetCourseUseCaseRequest,
	InstructorGetCourseUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: InstructorGetCourseUseCaseRequest
	): Promise<InstructorGetCourseUseCaseResponse> {
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

		return success({ course })
	}
}
