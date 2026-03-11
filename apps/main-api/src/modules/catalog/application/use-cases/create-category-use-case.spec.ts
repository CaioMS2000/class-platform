import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { CreateCategoryUseCase } from './create-category-use-case'
import { CategoryRepository } from '../repositories/category-repository'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'
import { CategoryNotFoundError } from '../@errors'

describe('CreateCategoryUseCase', () => {
	let categoryRepo: CategoryRepository
	let sut: CreateCategoryUseCase

	beforeEach(() => {
		categoryRepo = mock(CategoryRepository)
		sut = new CreateCategoryUseCase({
			categoryRepository: instance(categoryRepo),
			idGenerator: new FakeIdGenerator(),
		})
	})

	it('should return failure when parent category is not found', async () => {
		when(categoryRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			name: 'Web Dev',
			parentId: 'non-existent',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(CategoryNotFoundError)
	})

	it('should return success with created category', async () => {
		when(categoryRepo.save(anything())).thenResolve()

		const result = await sut.execute({
			name: 'Programming',
			description: 'Learn to code',
			icon: 'code',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { category } = result.value
			expect(category.name).toBe('Programming')
			expect(category.slug).toBe('programming')
			expect(category.icon).toBe('code')
		}
	})
})
