import {
	Result,
	IdGenerator,
	UseCase,
	success,
	UniqueId,
	failure,
} from '@repo/core'
import { Module } from '../../domain/entities/module'
import { ModuleRepository } from '../repositories/module-repository'
import { CourseRepository } from '../repositories/course-repository'
import { CourseNotFoundError } from '../@errors'

export type CreateModuleUseCaseRequest = {
	courseId: string
	title: string
	description?: string
	order: number
}

export type CreateModuleUseCaseResponse = Result<
	CourseNotFoundError,
	{
		module: Module
	}
>

type UseCaseProps = {
	moduleRepository: ModuleRepository
	courseRepository: CourseRepository
	idGenerator: IdGenerator
}

export class CreateModuleUseCase extends UseCase<
	CreateModuleUseCaseRequest,
	CreateModuleUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: CreateModuleUseCaseRequest
	): Promise<CreateModuleUseCaseResponse> {
		const { title, description, courseId, order } = input

		const course = await this.props.courseRepository.findById(
			UniqueId(courseId)
		)

		if (!course) {
			return failure(new CourseNotFoundError())
		}

		const module = await Module.create({
			input: {
				title,
				description,
				courseId: UniqueId(courseId),
				order,
			},
			idGenerator: this.props.idGenerator,
		})

		await this.props.moduleRepository.save(module)

		return success({ module })
	}
}
