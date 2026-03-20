import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { LessonRepository } from '../../repositories/lesson-repository'
import { CourseRepository } from '../../repositories/course-repository'
import { LessonNotFoundError, NotCourseOwnerError } from '../../@errors'

export type InstructorDeleteLessonUseCaseRequest = {
	lessonId: string
	instructorId: string
}

export type InstructorDeleteLessonUseCaseResponse = Result<
	LessonNotFoundError | NotCourseOwnerError,
	null
>

type UseCaseProps = {
	lessonRepository: LessonRepository
	courseRepository: CourseRepository
}

export class InstructorDeleteLessonUseCase extends UseCase<
	InstructorDeleteLessonUseCaseRequest,
	InstructorDeleteLessonUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: InstructorDeleteLessonUseCaseRequest
	): Promise<InstructorDeleteLessonUseCaseResponse> {
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

		await this.props.lessonRepository.delete(lesson)

		return success(null)
	}
}
