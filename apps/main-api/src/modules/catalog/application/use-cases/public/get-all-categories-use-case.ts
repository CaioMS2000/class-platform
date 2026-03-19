import { Result, UseCase, success } from '@repo/core'
import { Category } from '../../../domain/entities/category'
import { CategoryRepository } from '../../repositories/category-repository'

export type GetAllCategoriesUseCaseRequest = {}

export type GetAllCategoriesUseCaseResponse = Result<
	never,
	{
		categories: Category[]
	}
>

type UseCaseProps = {
	categoryRepository: CategoryRepository
}

export class GetAllCategoriesUseCase extends UseCase<
	GetAllCategoriesUseCaseRequest,
	GetAllCategoriesUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		_input: GetAllCategoriesUseCaseRequest
	): Promise<GetAllCategoriesUseCaseResponse> {
		const categories = await this.props.categoryRepository.findMany()

		return success({ categories })
	}
}
