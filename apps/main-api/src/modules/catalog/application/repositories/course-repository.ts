import { UniqueId } from '@repo/core'
import { Course } from '../../domain/entities/course'
import { Pagination } from './params'

export type CourseFilters = {
	status?: string
	level?: string
	categoryId?: UniqueId
	instructorId?: UniqueId
}

export abstract class CourseRepository {
	abstract save(course: Course): Promise<void>
	abstract update(course: Course): Promise<void>
	abstract delete(course: Course): Promise<void>
	abstract findById(id: UniqueId): Promise<Course | null>
	abstract getById(id: UniqueId): Promise<Course>
	abstract findBySlug(slug: string): Promise<Course | null>
	abstract findMany(
		filters?: CourseFilters,
		pagination?: Pagination
	): Promise<Course[]>
}
