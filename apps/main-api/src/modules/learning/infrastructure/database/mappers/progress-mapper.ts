import type { UniqueId } from '@repo/core'
import { Progress } from '../../../domain/models/progress'
import { nullIdGenerator } from '@/modules/auth-and-users/infrastructure/database/repositories/null-id-generator'
import type { lessonProgress } from '../schema'

type Row = typeof lessonProgress.$inferSelect
type InsertRow = typeof lessonProgress.$inferInsert

export class ProgressMapper {
	static async toDomain(row: Row): Promise<Progress> {
		return Progress.create({
			idGenerator: nullIdGenerator,
			id: row.id as UniqueId,
			input: {
				userId: row.userId as UniqueId,
				courseId: row.courseId as UniqueId,
				lessonId: row.lessonId as UniqueId,
				status: row.status,
				watchTime: row.watchTime,
				lastPosition: row.lastPosition,
				completedAt: row.completedAt ?? undefined,
				notesIds: (row.notesIds as string[] | null) ?? undefined,
				timeSpent: row.timeSpent,
				deviceType: row.deviceType ?? undefined,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
			},
		})
	}

	static toPersistence(progress: Progress): InsertRow {
		return {
			id: progress.id,
			userId: progress.userId,
			courseId: progress.courseId,
			lessonId: progress.lessonId,
			status: progress.status,
			watchTime: progress.watchTime,
			lastPosition: progress.lastPosition,
			completedAt: progress.completedAt,
			notesIds: progress.notesIds ?? null,
			timeSpent: progress.timeSpent,
			deviceType: progress.deviceType,
			createdAt: progress.createdAt,
			updatedAt: progress.updatedAt,
		}
	}
}
