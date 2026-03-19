import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Lesson } from '../../../domain/entities/lesson'
import { LessonRepository } from '../../repositories/lesson-repository'
import { ModuleRepository } from '../../repositories/module-repository'
import { ModuleNotFoundError } from '../../@errors'

export type GetAllLessonsUseCaseRequest = {
	moduleId: string
}

export type GetAllLessonsUseCaseResponse = Result<
	ModuleNotFoundError,
	{
		lessons: Lesson[]
	}
>

type UseCaseProps = {
	lessonRepository: LessonRepository
	moduleRepository: ModuleRepository
}

export class GetAllLessonsUseCase extends UseCase<
	GetAllLessonsUseCaseRequest,
	GetAllLessonsUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetAllLessonsUseCaseRequest
	): Promise<GetAllLessonsUseCaseResponse> {
		const { moduleId } = input

		const module = await this.props.moduleRepository.findById(
			UniqueId(moduleId)
		)

		if (!module) {
			return failure(new ModuleNotFoundError())
		}

		const lessons = await this.props.lessonRepository.findManyByModuleId(
			UniqueId(moduleId)
		)

		return success({ lessons })
	}
}
