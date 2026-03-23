import { UniqueId } from '@repo/core'
import { nullIdGenerator } from '@/modules/auth-and-users/infrastructure/database/repositories/null-id-generator'
import { Module } from '@/modules/catalog/domain/entities/module'
import type { courseModules } from '../schema'

type Row = typeof courseModules.$inferSelect
type InsertRow = typeof courseModules.$inferInsert

export class ModuleMapper {
	static async toDomain(row: Row): Promise<Module> {
		return Module.create({
			idGenerator: nullIdGenerator,
			id: UniqueId(row.id),
			input: {
				courseId: UniqueId(row.courseId),
				order: row.order,
				title: row.title,
				description: row.description ?? undefined,
				lessonsIds: (row.lessonsIds as string[]).map(id => UniqueId(id)),
				totalLessons: row.totalLessons,
				totalDuration: row.totalDuration,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
			},
		})
	}

	static toPersistence(module: Module): InsertRow {
		return {
			id: module.id,
			courseId: module.courseId,
			order: module.order,
			title: module.title,
			description: module.description,
			lessonsIds: module.lessonsIds,
			totalLessons: module.totalLessons,
			totalDuration: module.totalDuration,
			createdAt: module.createdAt,
			updatedAt: module.updatedAt,
		}
	}
}
