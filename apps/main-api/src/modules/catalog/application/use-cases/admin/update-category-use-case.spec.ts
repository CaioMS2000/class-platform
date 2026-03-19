import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UniqueId } from '@repo/core'
import { UpdateCategoryUseCase } from './update-category-use-case'
import { CategoryRepository } from '../../repositories/category-repository'
import { CategoryNotFoundError } from '../../@errors'
import { Category } from '../../../domain/entities/category'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('UpdateCategoryUseCase', () => {
	let categoryRepo: CategoryRepository
	let sut: UpdateCategoryUseCase

	beforeEach(() => {
		categoryRepo = mock(CategoryRepository)
		sut = new UpdateCategoryUseCase({
			categoryRepository: instance(categoryRepo),
		})
	})

	it('should return failure when category is not found', async () => {
		when(categoryRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			categoryId: 'non-existent-id',
			name: 'New Name',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(CategoryNotFoundError)
	})

	it('should return failure when parent category is not found', async () => {
		const category = await Category.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				name: 'Programming',
			},
		})

		// findById first returns the target category, next call for parentId returns null
		when(categoryRepo.findById(anything())).thenCall((id: UniqueId) => {
			if (id.toString() === category.id.toString())
				return Promise.resolve(category)
			return Promise.resolve(null)
		})

		const result = await sut.execute({
			categoryId: category.id.toString(),
			parentId: 'non-existent-parent',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(CategoryNotFoundError)
	})

	it('should return success with updated category', async () => {
		const category = await Category.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				name: 'Programming',
			},
		})

		when(categoryRepo.findById(anything())).thenResolve(category)
		when(categoryRepo.update(anything())).thenResolve()

		const result = await sut.execute({
			categoryId: category.id.toString(),
			name: 'Web Development',
			icon: 'web',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.category.name).toBe('Web Development')
			expect(result.value.category.icon).toBe('web')
		}
	})
})
