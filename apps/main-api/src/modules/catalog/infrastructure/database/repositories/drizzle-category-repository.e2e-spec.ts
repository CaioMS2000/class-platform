import { describe, it, expect, beforeEach } from 'bun:test'
import { drizzle } from '@/lib/drizzle'
import { DrizzleCategoryRepository } from './drizzle-category-repository'
import { categories } from '../schema'
import { makeCategory } from '@/modules/catalog/test/factories/make-category'

describe('DrizzleCategoryRepository', () => {
	const repo = new DrizzleCategoryRepository()

	beforeEach(async () => {
		await drizzle.delete(categories)
	})

	describe('save', () => {
		it('should persist a category', async () => {
			const category = await makeCategory()

			await repo.save(category)

			const found = await repo.findById(category.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(category.id)
			expect(found!.name).toBe(category.name)
			expect(found!.slug).toBe(category.slug)
		})
	})

	describe('update', () => {
		it('should update an existing category', async () => {
			const category = await makeCategory()
			await repo.save(category)

			const updated = category.update({ name: 'Updated Name' })
			await repo.update(updated)

			const found = await repo.findById(category.id)
			expect(found).not.toBeNull()
			expect(found!.name).toBe('Updated Name')
		})
	})

	describe('delete', () => {
		it('should remove a category', async () => {
			const category = await makeCategory()
			await repo.save(category)

			await repo.delete(category)

			const found = await repo.findById(category.id)
			expect(found).toBeNull()
		})
	})

	describe('findById', () => {
		it('should return a category when it exists', async () => {
			const category = await makeCategory()
			await repo.save(category)

			const found = await repo.findById(category.id)

			expect(found).not.toBeNull()
			expect(found!.id).toBe(category.id)
		})

		it('should return null when category does not exist', async () => {
			const found = await repo.findById('non-existent-id')
			expect(found).toBeNull()
		})
	})

	describe('getById', () => {
		it('should return a category when it exists', async () => {
			const category = await makeCategory()
			await repo.save(category)

			const found = await repo.getById(category.id)

			expect(found.id).toBe(category.id)
		})

		it('should throw when category does not exist', async () => {
			expect(async () => {
				await repo.getById('non-existent-id')
			}).toThrow()
		})
	})

	describe('findBySlug', () => {
		it('should return a category by its slug', async () => {
			const category = await makeCategory()
			await repo.save(category)

			const found = await repo.findBySlug(category.slug)

			expect(found).not.toBeNull()
			expect(found!.id).toBe(category.id)
			expect(found!.slug).toBe(category.slug)
		})

		it('should return null when slug does not exist', async () => {
			const found = await repo.findBySlug('non-existent-slug')
			expect(found).toBeNull()
		})
	})

	describe('findMany', () => {
		it('should return all categories', async () => {
			const category1 = await makeCategory()
			const category2 = await makeCategory()
			await repo.save(category1)
			await repo.save(category2)

			const result = await repo.findMany()

			expect(result).toHaveLength(2)
		})

		it('should return an empty array when no categories exist', async () => {
			const result = await repo.findMany()
			expect(result).toHaveLength(0)
		})
	})
})
