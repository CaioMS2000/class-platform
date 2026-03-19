import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { ModuleRepository } from '../../repositories/module-repository'
import { ModuleNotFoundError } from '../../@errors'

export type DeleteModuleUseCaseRequest = {
	moduleId: string
}

export type DeleteModuleUseCaseResponse = Result<ModuleNotFoundError, null>

type UseCaseProps = {
	moduleRepository: ModuleRepository
}

export class DeleteModuleUseCase extends UseCase<
	DeleteModuleUseCaseRequest,
	DeleteModuleUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: DeleteModuleUseCaseRequest
	): Promise<DeleteModuleUseCaseResponse> {
		const { moduleId } = input

		const module = await this.props.moduleRepository.findById(
			UniqueId(moduleId)
		)

		if (!module) {
			return failure(new ModuleNotFoundError())
		}

		await this.props.moduleRepository.delete(module)

		return success(null)
	}
}
