import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Lesson } from '../../../domain/entities/lesson'
import { LessonRepository } from '../../repositories/lesson-repository'
import { LessonNotFoundError } from '../../@errors'

export type GetLessonUseCaseRequest = {
	lessonId: string
}

export type GetLessonUseCaseResponse = Result<
	LessonNotFoundError,
	{
		lesson: Lesson
	}
>

type UseCaseProps = {
	lessonRepository: LessonRepository
}

export class GetLessonUseCase extends UseCase<
	GetLessonUseCaseRequest,
	GetLessonUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetLessonUseCaseRequest
	): Promise<GetLessonUseCaseResponse> {
		const { lessonId } = input

		const lesson = await this.props.lessonRepository.findById(
			UniqueId(lessonId)
		)

		if (!lesson) {
			return failure(new LessonNotFoundError())
		}

		return success({ lesson })
	}
}
