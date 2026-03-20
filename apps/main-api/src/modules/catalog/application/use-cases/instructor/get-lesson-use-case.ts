import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Lesson } from '../../../domain/entities/lesson'
import { LessonRepository } from '../../repositories/lesson-repository'
import { CourseRepository } from '../../repositories/course-repository'
import { LessonNotFoundError, NotCourseOwnerError } from '../../@errors'

export type InstructorGetLessonUseCaseRequest = {
	lessonId: string
	instructorId: string
}

export type InstructorGetLessonUseCaseResponse = Result<
	LessonNotFoundError | NotCourseOwnerError,
	{
		lesson: Lesson
	}
>

type UseCaseProps = {
	lessonRepository: LessonRepository
	courseRepository: CourseRepository
}

export class InstructorGetLessonUseCase extends UseCase<
	InstructorGetLessonUseCaseRequest,
	InstructorGetLessonUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: InstructorGetLessonUseCaseRequest
	): Promise<InstructorGetLessonUseCaseResponse> {
		const { lessonId, instructorId } = input

		const lesson = await this.props.lessonRepository.findById(
			UniqueId(lessonId)
		)

		if (!lesson) {
			return failure(new LessonNotFoundError())
		}

		const course = await this.props.courseRepository.findById(lesson.courseId)

		if (!course || course.instructorId !== UniqueId(instructorId)) {
			return failure(new NotCourseOwnerError())
		}

		return success({ lesson })
	}
}
