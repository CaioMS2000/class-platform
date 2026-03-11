import { UniqueId } from '@repo/core'
import { Lesson } from '../../domain/entities/lesson'

export abstract class LessonRepository {
	abstract save(lesson: Lesson): Promise<void>
	abstract update(lesson: Lesson): Promise<void>
	abstract delete(lesson: Lesson): Promise<void>
	abstract findById(id: UniqueId): Promise<Lesson | null>
	abstract getById(id: UniqueId): Promise<Lesson>
	abstract findManyByModuleId(moduleId: UniqueId): Promise<Lesson[]>
}
