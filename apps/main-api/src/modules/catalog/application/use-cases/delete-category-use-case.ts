import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { CategoryRepository } from '../repositories/category-repository'
import { CategoryNotFoundError } from '../@errors'

export type DeleteCategoryUseCaseRequest = {
	categoryId: string
}

export type DeleteCategoryUseCaseResponse = Result<CategoryNotFoundError, null>

type UseCaseProps = {
	categoryRepository: CategoryRepository
}

export class DeleteCategoryUseCase extends UseCase<
	DeleteCategoryUseCaseRequest,
	DeleteCategoryUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: DeleteCategoryUseCaseRequest
	): Promise<DeleteCategoryUseCaseResponse> {
		const { categoryId } = input

		const category = await this.props.categoryRepository.findById(
			UniqueId(categoryId)
		)

		if (!category) {
			return failure(new CategoryNotFoundError())
		}

		await this.props.categoryRepository.delete(category)

		return success(null)
	}
}
