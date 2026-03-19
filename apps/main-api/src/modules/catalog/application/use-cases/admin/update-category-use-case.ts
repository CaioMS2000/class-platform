import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Category } from '../../../domain/entities/category'
import { CategoryRepository } from '../../repositories/category-repository'
import { CategoryNotFoundError } from '../../@errors'

export type UpdateCategoryUseCaseRequest = {
	categoryId: string
	name?: string
	description?: string
	parentId?: string
	icon?: string
}

export type UpdateCategoryUseCaseResponse = Result<
	CategoryNotFoundError,
	{
		category: Category
	}
>

type UseCaseProps = {
	categoryRepository: CategoryRepository
}

export class UpdateCategoryUseCase extends UseCase<
	UpdateCategoryUseCaseRequest,
	UpdateCategoryUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: UpdateCategoryUseCaseRequest
	): Promise<UpdateCategoryUseCaseResponse> {
		const { categoryId, name, description, parentId, icon } = input

		const category = await this.props.categoryRepository.findById(
			UniqueId(categoryId)
		)

		if (!category) {
			return failure(new CategoryNotFoundError())
		}

		let newParentId: UniqueId | undefined

		if (parentId) {
			const parentCategory = await this.props.categoryRepository.findById(
				UniqueId(parentId)
			)

			if (!parentCategory) {
				return failure(new CategoryNotFoundError('Parent category not found'))
			}
			newParentId = UniqueId(parentId)
		}

		const updatedCategory = category.update({
			name,
			description,
			icon,
			...(newParentId !== undefined && { parentId: newParentId }),
		})

		await this.props.categoryRepository.update(updatedCategory)

		return success({ category: updatedCategory })
	}
}
