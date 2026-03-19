import { instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { GetAllCategoriesUseCase } from './get-all-categories-use-case'
import { CategoryRepository } from '../../repositories/category-repository'
import { Category } from '../../../domain/entities/category'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('GetAllCategoriesUseCase', () => {
	let categoryRepo: CategoryRepository
	let sut: GetAllCategoriesUseCase

	beforeEach(() => {
		categoryRepo = mock(CategoryRepository)
		sut = new GetAllCategoriesUseCase({
			categoryRepository: instance(categoryRepo),
		})
	})

	it('should return success with categories list', async () => {
		const category1 = await Category.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				name: 'Programming',
			},
		})

		const category2 = await Category.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				name: 'Design',
			},
		})

		when(categoryRepo.findMany()).thenResolve([category1, category2])

		const result = await sut.execute({})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.categories).toHaveLength(2)
			expect(result.value.categories[0].name).toBe('Programming')
			expect(result.value.categories[1].name).toBe('Design')
		}
	})
})
