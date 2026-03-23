import { eq } from 'drizzle-orm'
import { drizzle } from '@/lib/drizzle'
import { CourseRepository } from '../../../application/repositories/course-repository'
import type { Course } from '../../../domain/models/course'
import { courses } from '@/modules/catalog/infrastructure/database/schema'
import { CourseMapper } from '../mappers/course-mapper'

export class DrizzleCourseRepository extends CourseRepository {
	async findById(id: string): Promise<Course | null> {
		const [row] = await drizzle.select().from(courses).where(eq(courses.id, id))
		if (!row) return null
		return CourseMapper.toDomain(row)
	}

	async save(course: Course): Promise<void> {
		const { id, createdAt, ...updateData } = CourseMapper.toPersistence(course)
		await drizzle
			.update(courses)
			.set(updateData)
			.where(eq(courses.id, course.id))
	}
}
