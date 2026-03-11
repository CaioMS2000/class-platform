import { UniqueId } from '@repo/core'
import { Module } from '../../domain/entities/module'

export abstract class ModuleRepository {
	abstract save(module: Module): Promise<void>
	abstract update(module: Module): Promise<void>
	abstract delete(module: Module): Promise<void>
	abstract findById(id: UniqueId): Promise<Module | null>
	abstract getById(id: UniqueId): Promise<Module>
	abstract findManyByCourseId(courseId: UniqueId): Promise<Module[]>
}
