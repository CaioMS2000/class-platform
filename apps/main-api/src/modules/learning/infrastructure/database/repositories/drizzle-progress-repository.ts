import { and, eq } from 'drizzle-orm'
import { drizzle } from '@/lib/drizzle'
import { type UniqueId } from '@repo/core'
import { ProgressRepository } from '../../../application/repositories/progress-repository'
import { Progress } from '../../../domain/models/progress'
import { lessonProgress } from '../schema'
import { ProgressMapper } from '../mappers/progress-mapper'

export class DrizzleProgressRepository extends ProgressRepository {
	async findByUserAndLesson(
		userId: UniqueId,
		lessonId: UniqueId
	): Promise<Progress | null> {
		const [row] = await drizzle
			.select()
			.from(lessonProgress)
			.where(
				and(
					eq(lessonProgress.userId, userId),
					eq(lessonProgress.lessonId, lessonId)
				)
			)
		if (!row) return null
		return ProgressMapper.toDomain(row)
	}

	async findManyByUserAndCourse(
		userId: UniqueId,
		courseId: UniqueId
	): Promise<Progress[]> {
		const rows = await drizzle
			.select()
			.from(lessonProgress)
			.where(
				and(
					eq(lessonProgress.userId, userId),
					eq(lessonProgress.courseId, courseId)
				)
			)
		return Promise.all(rows.map(row => ProgressMapper.toDomain(row)))
	}

	async save(progress: Progress): Promise<void> {
		await drizzle
			.insert(lessonProgress)
			.values(ProgressMapper.toPersistence(progress))
	}

	async update(progress: Progress): Promise<void> {
		const { id, userId, courseId, lessonId, createdAt, ...updateData } =
			ProgressMapper.toPersistence(progress)
		await drizzle
			.update(lessonProgress)
			.set(updateData)
			.where(eq(lessonProgress.id, progress.id))
	}
}
