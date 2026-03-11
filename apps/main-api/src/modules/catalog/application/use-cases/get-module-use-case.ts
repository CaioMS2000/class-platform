import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Module } from '../../domain/entities/module'
import { ModuleRepository } from '../repositories/module-repository'
import { ModuleNotFoundError } from '../@errors'

export type GetModuleUseCaseRequest = {
	moduleId: string
}

export type GetModuleUseCaseResponse = Result<
	ModuleNotFoundError,
	{
		module: Module
	}
>

type UseCaseProps = {
	moduleRepository: ModuleRepository
}

export class GetModuleUseCase extends UseCase<
	GetModuleUseCaseRequest,
	GetModuleUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetModuleUseCaseRequest
	): Promise<GetModuleUseCaseResponse> {
		const { moduleId } = input

		const module = await this.props.moduleRepository.findById(
			UniqueId(moduleId)
		)

		if (!module) {
			return failure(new ModuleNotFoundError())
		}

		return success({ module })
	}
}
