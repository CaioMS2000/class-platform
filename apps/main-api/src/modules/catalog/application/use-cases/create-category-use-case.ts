import {
	Result,
	IdGenerator,
	UseCase,
	success,
	UniqueId,
	failure,
} from '@repo/core'
import { Category } from '../../domain/entities/category'
import { CategoryRepository } from '../repositories/category-repository'
import { CategoryNotFoundError } from '../@errors'

export type CreateCategoryUseCaseRequest = {
	name: string
	description?: string
	parentId?: string
	icon?: string
}

export type CreateCategoryUseCaseResponse = Result<
	CategoryNotFoundError,
	{
		category: Category
	}
>

type UseCaseProps = {
	categoryRepository: CategoryRepository
	idGenerator: IdGenerator
}

export class CreateCategoryUseCase extends UseCase<
	CreateCategoryUseCaseRequest,
	CreateCategoryUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: CreateCategoryUseCaseRequest
	): Promise<CreateCategoryUseCaseResponse> {
		const { name, description, parentId, icon } = input

		if (parentId) {
			const parentCategory = await this.props.categoryRepository.findById(
				UniqueId(parentId)
			)

			if (!parentCategory) {
				return failure(new CategoryNotFoundError('Parent category not found'))
			}
		}

		const category = await Category.create({
			input: {
				name,
				description,
				parentId: parentId ? UniqueId(parentId) : undefined,
				icon,
			},
			idGenerator: this.props.idGenerator,
		})

		await this.props.categoryRepository.save(category)

		return success({ category })
	}
}
