import { UniqueId } from '@repo/core'
import { nullIdGenerator } from '@/modules/auth-and-users/infrastructure/database/repositories/null-id-generator'
import { Lesson } from '@/modules/catalog/domain/entities/lesson'
import type { LessonContent, LessonType } from '@/modules/catalog/domain/@types'
import type { lessons } from '../schema'

type Row = typeof lessons.$inferSelect
type InsertRow = typeof lessons.$inferInsert

export class LessonMapper {
	static async toDomain(row: Row): Promise<Lesson> {
		return Lesson.create({
			idGenerator: nullIdGenerator,
			id: UniqueId(row.id),
			input: {
				moduleId: UniqueId(row.moduleId),
				courseId: UniqueId(row.courseId),
				order: row.order,
				title: row.title,
				description: row.description ?? undefined,
				type: row.type as LessonType,
				content: row.content as LessonContent,
				duration: row.duration,
				isFree: row.isFree,
				requiresPrevious: row.requiresPrevious,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
			},
		})
	}

	static toPersistence(lesson: Lesson): InsertRow {
		return {
			id: lesson.id,
			moduleId: lesson.moduleId,
			courseId: lesson.courseId,
			order: lesson.order,
			title: lesson.title,
			description: lesson.description,
			type: lesson.type,
			content: lesson.content as Record<string, unknown>,
			duration: lesson.duration,
			isFree: lesson.isFree,
			requiresPrevious: lesson.requiresPrevious,
			createdAt: lesson.createdAt,
			updatedAt: lesson.updatedAt,
		}
	}
}
