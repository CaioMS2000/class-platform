import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Lesson } from '../../../domain/entities/lesson'
import { LessonRepository } from '../../repositories/lesson-repository'
import { CourseRepository } from '../../repositories/course-repository'
import { LessonNotFoundError, NotCourseOwnerError } from '../../@errors'
import { LessonContent, LessonType } from '../../../domain/@types'

export type InstructorUpdateLessonUseCaseRequest = {
	lessonId: string
	instructorId: string
	title?: string
	description?: string
	order?: number
	type?: LessonType
	content?: LessonContent
	duration?: number
	isFree?: boolean
	requiresPrevious?: boolean
}

export type InstructorUpdateLessonUseCaseResponse = Result<
	LessonNotFoundError | NotCourseOwnerError,
	{
		lesson: Lesson
	}
>

type UseCaseProps = {
	lessonRepository: LessonRepository
	courseRepository: CourseRepository
}

export class InstructorUpdateLessonUseCase extends UseCase<
	InstructorUpdateLessonUseCaseRequest,
	InstructorUpdateLessonUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: InstructorUpdateLessonUseCaseRequest
	): Promise<InstructorUpdateLessonUseCaseResponse> {
		const {
			lessonId,
			instructorId,
			title,
			description,
			order,
			type,
			content,
			duration,
			isFree,
			requiresPrevious,
		} = input

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

		const updatedLesson = lesson.update({
			title,
			description,
			order,
			type,
			content,
			duration,
			isFree,
			requiresPrevious,
		})

		await this.props.lessonRepository.update(updatedLesson)

		return success({ lesson: updatedLesson })
	}
}
