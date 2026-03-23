import type { UniqueId } from '@repo/core'
import { eq } from 'drizzle-orm'
import { drizzle } from '@/lib/drizzle'
import { CategoryRepository } from '@/modules/catalog/application/repositories/category-repository'
import type { Category } from '@/modules/catalog/domain/entities/category'
import { CategoryMapper } from '../mappers/category-mapper'
import { categories } from '../schema'

export class DrizzleCategoryRepository extends CategoryRepository {
	async save(category: Category): Promise<void> {
		await drizzle
			.insert(categories)
			.values(CategoryMapper.toPersistence(category))
	}

	async update(category: Category): Promise<void> {
		const { id, ...data } = CategoryMapper.toPersistence(category)
		await drizzle
			.update(categories)
			.set(data)
			.where(eq(categories.id, category.id))
	}

	async delete(category: Category): Promise<void> {
		await drizzle.delete(categories).where(eq(categories.id, category.id))
	}

	async findById(id: UniqueId): Promise<Category | null> {
		const [row] = await drizzle
			.select()
			.from(categories)
			.where(eq(categories.id, id))
		if (!row) return null
		return CategoryMapper.toDomain(row)
	}

	async getById(id: UniqueId): Promise<Category> {
		const category = await this.findById(id)
		if (!category) throw new Error(`Category not found: ${id}`)
		return category
	}

	async findBySlug(slug: string): Promise<Category | null> {
		const [row] = await drizzle
			.select()
			.from(categories)
			.where(eq(categories.slug, slug))
		if (!row) return null
		return CategoryMapper.toDomain(row)
	}

	async findMany(): Promise<Category[]> {
		const rows = await drizzle.select().from(categories)
		return Promise.all(rows.map(CategoryMapper.toDomain))
	}
}
