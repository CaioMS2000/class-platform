import { UniqueId } from '@repo/core'
import { Category } from '../../domain/entities/category'

export abstract class CategoryRepository {
	abstract save(category: Category): Promise<void>
	abstract update(category: Category): Promise<void>
	abstract delete(category: Category): Promise<void>
	abstract findById(id: UniqueId): Promise<Category | null>
	abstract getById(id: UniqueId): Promise<Category>
	abstract findBySlug(slug: string): Promise<Category | null>
	abstract findMany(): Promise<Category[]>
}
