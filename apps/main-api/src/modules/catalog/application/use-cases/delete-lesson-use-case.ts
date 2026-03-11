import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { LessonRepository } from '../repositories/lesson-repository'
import { LessonNotFoundError } from '../@errors'

export type DeleteLessonUseCaseRequest = {
	lessonId: string
}

export type DeleteLessonUseCaseResponse = Result<LessonNotFoundError, null>

type UseCaseProps = {
	lessonRepository: LessonRepository
}

export class DeleteLessonUseCase extends UseCase<
	DeleteLessonUseCaseRequest,
	DeleteLessonUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: DeleteLessonUseCaseRequest
	): Promise<DeleteLessonUseCaseResponse> {
		const { lessonId } = input

		const lesson = await this.props.lessonRepository.findById(
			UniqueId(lessonId)
		)

		if (!lesson) {
			return failure(new LessonNotFoundError())
		}

		await this.props.lessonRepository.delete(lesson)

		return success(null)
	}
}
