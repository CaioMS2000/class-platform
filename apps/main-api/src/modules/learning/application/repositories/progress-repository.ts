import type { UniqueId } from '@repo/core'
import type { Progress } from '../../domain/models/progress'

export abstract class ProgressRepository {
	abstract findByUserAndLesson(
		userId: UniqueId,
		lessonId: UniqueId
	): Promise<Progress | null>
	abstract findManyByUserAndCourse(
		userId: UniqueId,
		courseId: UniqueId
	): Promise<Progress[]>
	abstract save(progress: Progress): Promise<void>
	abstract update(progress: Progress): Promise<void>
}
