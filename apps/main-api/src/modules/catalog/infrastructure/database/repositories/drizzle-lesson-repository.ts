import { eq } from 'drizzle-orm'
import type { UniqueId } from '@repo/core'
import { drizzle } from '@/lib/drizzle'
import { LessonRepository } from '@/modules/catalog/application/repositories/lesson-repository'
import type { Lesson } from '@/modules/catalog/domain/entities/lesson'
import { lessons } from '../schema'
import { LessonMapper } from '../mappers/lesson-mapper'

export class DrizzleLessonRepository extends LessonRepository {
	async save(lesson: Lesson): Promise<void> {
		await drizzle.insert(lessons).values(LessonMapper.toPersistence(lesson))
	}

	async update(lesson: Lesson): Promise<void> {
		const { id, moduleId, courseId, createdAt, ...data } =
			LessonMapper.toPersistence(lesson)
		await drizzle.update(lessons).set(data).where(eq(lessons.id, lesson.id))
	}

	async delete(lesson: Lesson): Promise<void> {
		await drizzle.delete(lessons).where(eq(lessons.id, lesson.id))
	}

	async findById(id: UniqueId): Promise<Lesson | null> {
		const [row] = await drizzle.select().from(lessons).where(eq(lessons.id, id))
		if (!row) return null
		return LessonMapper.toDomain(row)
	}

	async getById(id: UniqueId): Promise<Lesson> {
		const lesson = await this.findById(id)
		if (!lesson) throw new Error(`Lesson not found: ${id}`)
		return lesson
	}

	async findManyByModuleId(moduleId: UniqueId): Promise<Lesson[]> {
		const rows = await drizzle
			.select()
			.from(lessons)
			.where(eq(lessons.moduleId, moduleId))
		return Promise.all(rows.map(LessonMapper.toDomain))
	}

	async findManyByCourseId(courseId: UniqueId): Promise<Lesson[]> {
		const rows = await drizzle
			.select()
			.from(lessons)
			.where(eq(lessons.courseId, courseId))
		return Promise.all(rows.map(LessonMapper.toDomain))
	}
}
