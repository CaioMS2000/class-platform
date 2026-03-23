import { eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { CourseRepository } from '../../../application/repositories/course-repository'
import type { Course } from '../../../domain/models/course'
import { courses } from '@/modules/catalog/infrastructure/database/schema'
import { CourseMapper } from '../mappers/course-mapper'

export class DrizzleCourseRepository extends CourseRepository {
	constructor(private readonly db: NodePgDatabase) {
		super()
	}

	async findById(id: string): Promise<Course | null> {
		const [row] = await this.db.select().from(courses).where(eq(courses.id, id))
		if (!row) return null
		return CourseMapper.toDomain(row)
	}

	async save(course: Course): Promise<void> {
		const { id, createdAt, ...updateData } = CourseMapper.toPersistence(course)
		await this.db
			.update(courses)
			.set(updateData)
			.where(eq(courses.id, course.id))
	}
}
