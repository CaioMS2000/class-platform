import { UniqueId } from '@repo/core'
import { nullIdGenerator } from '@/modules/auth-and-users/infrastructure/database/repositories/null-id-generator'
import { Category } from '@/modules/catalog/domain/entities/category'
import type { categories } from '../schema'

type Row = typeof categories.$inferSelect
type InsertRow = typeof categories.$inferInsert

export class CategoryMapper {
	static async toDomain(row: Row): Promise<Category> {
		return Category.create({
			idGenerator: nullIdGenerator,
			id: UniqueId(row.id),
			input: {
				name: row.name,
				slug: row.slug,
				description: row.description ?? undefined,
				parentId: row.parentId ? UniqueId(row.parentId) : undefined,
				icon: row.icon ?? undefined,
			},
		})
	}

	static toPersistence(category: Category): InsertRow {
		return {
			id: category.id,
			name: category.name,
			slug: category.slug,
			description: category.description,
			parentId: category.parentId,
			icon: category.icon,
		}
	}
}
