import { eq, and, sql } from 'drizzle-orm'
import type { UniqueId } from '@repo/core'
import { drizzle } from '@/lib/drizzle'
import {
	CourseRepository,
	type CourseFilters,
} from '@/modules/catalog/application/repositories/course-repository'
import type { Pagination } from '@/modules/catalog/application/repositories/params'
import type { Course } from '@/modules/catalog/domain/entities/course'
import { courses } from '../schema'
import { CourseMapper } from '../mappers/course-mapper'

export class DrizzleCourseRepository extends CourseRepository {
	async save(course: Course): Promise<void> {
		await drizzle.insert(courses).values(CourseMapper.toPersistence(course))
	}

	async update(course: Course): Promise<void> {
		const { id, createdAt, ...data } = CourseMapper.toPersistence(course)
		await drizzle.update(courses).set(data).where(eq(courses.id, course.id))
	}

	async delete(course: Course): Promise<void> {
		await drizzle.delete(courses).where(eq(courses.id, course.id))
	}

	async findById(id: UniqueId): Promise<Course | null> {
		const [row] = await drizzle.select().from(courses).where(eq(courses.id, id))
		if (!row) return null
		return CourseMapper.toDomain(row)
	}

	async getById(id: UniqueId): Promise<Course> {
		const course = await this.findById(id)
		if (!course) throw new Error(`Course not found: ${id}`)
		return course
	}

	async findBySlug(slug: string): Promise<Course | null> {
		const [row] = await drizzle
			.select()
			.from(courses)
			.where(eq(courses.slug, slug))
		if (!row) return null
		return CourseMapper.toDomain(row)
	}

	async findMany(
		filters?: CourseFilters,
		pagination?: Pagination
	): Promise<Course[]> {
		const conditions = []

		if (filters?.status) {
			conditions.push(
				eq(
					courses.status,
					filters.status as (typeof courses.status.enumValues)[number]
				)
			)
		}

		if (filters?.level) {
			conditions.push(
				eq(
					courses.level,
					filters.level as (typeof courses.level.enumValues)[number]
				)
			)
		}

		if (filters?.instructorId) {
			conditions.push(eq(courses.instructorId, filters.instructorId))
		}

		if (filters?.categoryId) {
			conditions.push(
				sql`${courses.categoriesIds} @> ${JSON.stringify([filters.categoryId])}::jsonb`
			)
		}

		let query = drizzle
			.select()
			.from(courses)
			.where(conditions.length ? and(...conditions) : undefined)
			.$dynamic()

		if (pagination?.limit !== undefined) {
			query = query.limit(pagination.limit)
			if (pagination.page !== undefined) {
				query = query.offset((pagination.page - 1) * pagination.limit)
			}
		}

		const rows = await query
		return Promise.all(rows.map(CourseMapper.toDomain))
	}
}
