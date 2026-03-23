import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { DeleteCategoryUseCase } from './delete-category-use-case'
import { CategoryRepository } from '../../repositories/category-repository'
import { CategoryNotFoundError } from '../../@errors'
import { Category } from '../../../domain/entities/category'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('DeleteCategoryUseCase', () => {
	let categoryRepo: CategoryRepository
	let sut: DeleteCategoryUseCase

	beforeEach(() => {
		categoryRepo = mock(CategoryRepository)
		sut = new DeleteCategoryUseCase({
			categoryRepository: instance(categoryRepo),
		})
	})

	it('should return failure when category is not found', async () => {
		when(categoryRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			categoryId: 'non-existent-id',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(CategoryNotFoundError)
	})

	it('should return success and delete category', async () => {
		const category = await Category.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				name: 'Tech',
			},
		})

		when(categoryRepo.findById(anything())).thenResolve(category)
		when(categoryRepo.delete(anything())).thenResolve()

		const result = await sut.execute({
			categoryId: category.id.toString(),
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value).toBeNull()
		}
	})
})
