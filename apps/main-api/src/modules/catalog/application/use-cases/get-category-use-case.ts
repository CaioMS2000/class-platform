import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Category } from '../../domain/entities/category'
import { CategoryRepository } from '../repositories/category-repository'
import { CategoryNotFoundError } from '../@errors'

export type GetCategoryUseCaseRequest = {
	categoryId: string
}

export type GetCategoryUseCaseResponse = Result<
	CategoryNotFoundError,
	{
		category: Category
	}
>

type UseCaseProps = {
	categoryRepository: CategoryRepository
}

export class GetCategoryUseCase extends UseCase<
	GetCategoryUseCaseRequest,
	GetCategoryUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetCategoryUseCaseRequest
	): Promise<GetCategoryUseCaseResponse> {
		const { categoryId } = input

		const category = await this.props.categoryRepository.findById(
			UniqueId(categoryId)
		)

		if (!category) {
			return failure(new CategoryNotFoundError())
		}

		return success({ category })
	}
}
