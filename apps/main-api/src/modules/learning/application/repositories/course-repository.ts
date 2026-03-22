import type { Course } from '../../domain/models/course'

export abstract class CourseRepository {
	abstract findById(id: string): Promise<Course | null>
	abstract save(course: Course): Promise<void>
}
