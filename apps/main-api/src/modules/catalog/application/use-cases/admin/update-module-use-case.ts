import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Module } from '../../../domain/entities/module'
import { ModuleRepository } from '../../repositories/module-repository'
import { ModuleNotFoundError } from '../../@errors'

export type UpdateModuleUseCaseRequest = {
	moduleId: string
	title?: string
	description?: string
	order?: number
}

export type UpdateModuleUseCaseResponse = Result<
	ModuleNotFoundError,
	{
		module: Module
	}
>

type UseCaseProps = {
	moduleRepository: ModuleRepository
}

export class UpdateModuleUseCase extends UseCase<
	UpdateModuleUseCaseRequest,
	UpdateModuleUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: UpdateModuleUseCaseRequest
	): Promise<UpdateModuleUseCaseResponse> {
		const { moduleId, title, description, order } = input

		const module = await this.props.moduleRepository.findById(
			UniqueId(moduleId)
		)

		if (!module) {
			return failure(new ModuleNotFoundError())
		}

		const updatedModule = module.update({
			title,
			description,
			order,
		})

		await this.props.moduleRepository.update(updatedModule)

		return success({ module: updatedModule })
	}
}
