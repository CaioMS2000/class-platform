import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Module } from '../../domain/entities/module'
import { ModuleRepository } from '../repositories/module-repository'
import { CourseRepository } from '../repositories/course-repository'
import { CourseNotFoundError } from '../@errors'

export type GetAllModulesUseCaseRequest = {
	courseId: string
}

export type GetAllModulesUseCaseResponse = Result<
	CourseNotFoundError,
	{
		modules: Module[]
	}
>

type UseCaseProps = {
	moduleRepository: ModuleRepository
	courseRepository: CourseRepository
}

export class GetAllModulesUseCase extends UseCase<
	GetAllModulesUseCaseRequest,
	GetAllModulesUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetAllModulesUseCaseRequest
	): Promise<GetAllModulesUseCaseResponse> {
		const { courseId } = input

		const course = await this.props.courseRepository.findById(
			UniqueId(courseId)
		)

		if (!course) {
			return failure(new CourseNotFoundError())
		}

		const modules = await this.props.moduleRepository.findManyByCourseId(
			UniqueId(courseId)
		)

		return success({ modules })
	}
}
