import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UniqueId } from '@repo/core'
import { GetCategoryUseCase } from './get-category-use-case'
import { CategoryRepository } from '../../repositories/category-repository'
import { CategoryNotFoundError } from '../../@errors'
import { Category } from '../../../domain/entities/category'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('GetCategoryUseCase', () => {
	let categoryRepo: CategoryRepository
	let sut: GetCategoryUseCase

	beforeEach(() => {
		categoryRepo = mock(CategoryRepository)
		sut = new GetCategoryUseCase({
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

	it('should return success with category', async () => {
		const category = await Category.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				name: 'Programming',
				icon: 'code',
			},
		})

		when(categoryRepo.findById(anything())).thenResolve(category)

		const result = await sut.execute({
			categoryId: category.id.toString(),
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.category.id.toString()).toBe(category.id.toString())
		}
	})
})
