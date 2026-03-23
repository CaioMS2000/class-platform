import type { UniqueId } from '@repo/core'
import { Enrollment } from '../../../domain/models/enrollment'
import { EnrollmentProgressValue } from '../../../domain/value-objects'
import { nullIdGenerator } from '@/modules/auth-and-users/infrastructure/database/repositories/null-id-generator'
import type { enrollments } from '../schema'

type Row = typeof enrollments.$inferSelect
type InsertRow = typeof enrollments.$inferInsert

export class EnrollmentMapper {
	static async toDomain(row: Row): Promise<Enrollment> {
		const progressResult = EnrollmentProgressValue.create(row.progressValue)
		if (progressResult.isFailure())
			throw new Error('Invalid progress value in database')
		const progressValue = progressResult.value

		return Enrollment.create({
			idGenerator: nullIdGenerator,
			id: row.id as UniqueId,
			input: {
				userId: row.userId as UniqueId,
				courseId: row.courseId as UniqueId,
				status: row.status,
				progressValue,
				completedLessons: row.completedLessons,
				totalLessons: row.totalLessons,
				enrolledAt: row.enrolledAt,
				expiresAt: row.expiresAt ?? undefined,
				lastAccessAt: row.lastAccessAt ?? undefined,
				certificateIssued: row.certificateIssued,
				certificateUrl: row.certificateUrl ?? undefined,
				completedAt: row.completedAt ?? undefined,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
			},
		})
	}

	static toPersistence(enrollment: Enrollment): InsertRow {
		return {
			id: enrollment.id,
			userId: enrollment.userId,
			courseId: enrollment.courseId,
			status: enrollment.status,
			progressValue: enrollment.progressValue.value,
			completedLessons: enrollment.completedLessons,
			totalLessons: enrollment.totalLessons,
			enrolledAt: enrollment.enrolledAt,
			expiresAt: enrollment.expiresAt,
			lastAccessAt: enrollment.lastAccessAt,
			certificateIssued: enrollment.certificateIssued,
			certificateUrl: enrollment.certificateUrl,
			completedAt: enrollment.completedAt,
			createdAt: enrollment.createdAt,
			updatedAt: enrollment.updatedAt,
		}
	}
}
