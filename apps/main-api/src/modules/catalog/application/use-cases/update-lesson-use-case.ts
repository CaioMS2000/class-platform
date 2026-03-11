import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Lesson } from '../../domain/entities/lesson'
import { LessonRepository } from '../repositories/lesson-repository'
import { LessonNotFoundError } from '../@errors'
import { LessonContent, LessonType } from '../../domain/@types'

export type UpdateLessonUseCaseRequest = {
	lessonId: string
	title?: string
	description?: string
	order?: number
	type?: LessonType
	content?: LessonContent
	duration?: number
	isFree?: boolean
	requiresPrevious?: boolean
}

export type UpdateLessonUseCaseResponse = Result<
	LessonNotFoundError,
	{
		lesson: Lesson
	}
>

type UseCaseProps = {
	lessonRepository: LessonRepository
}

export class UpdateLessonUseCase extends UseCase<
	UpdateLessonUseCaseRequest,
	UpdateLessonUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: UpdateLessonUseCaseRequest
	): Promise<UpdateLessonUseCaseResponse> {
		const {
			lessonId,
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
