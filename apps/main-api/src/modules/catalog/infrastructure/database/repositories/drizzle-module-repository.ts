import { eq } from 'drizzle-orm'
import type { UniqueId } from '@repo/core'
import { drizzle } from '@/lib/drizzle'
import { ModuleRepository } from '@/modules/catalog/application/repositories/module-repository'
import type { Module } from '@/modules/catalog/domain/entities/module'
import { courseModules } from '../schema'
import { ModuleMapper } from '../mappers/module-mapper'

export class DrizzleModuleRepository extends ModuleRepository {
	async save(module: Module): Promise<void> {
		await drizzle
			.insert(courseModules)
			.values(ModuleMapper.toPersistence(module))
	}

	async update(module: Module): Promise<void> {
		const { id, courseId, createdAt, ...data } =
			ModuleMapper.toPersistence(module)
		await drizzle
			.update(courseModules)
			.set(data)
			.where(eq(courseModules.id, module.id))
	}

	async delete(module: Module): Promise<void> {
		await drizzle.delete(courseModules).where(eq(courseModules.id, module.id))
	}

	async findById(id: UniqueId): Promise<Module | null> {
		const [row] = await drizzle
			.select()
			.from(courseModules)
			.where(eq(courseModules.id, id))
		if (!row) return null
		return ModuleMapper.toDomain(row)
	}

	async getById(id: UniqueId): Promise<Module> {
		const module = await this.findById(id)
		if (!module) throw new Error(`Module not found: ${id}`)
		return module
	}

	async findManyByCourseId(courseId: UniqueId): Promise<Module[]> {
		const rows = await drizzle
			.select()
			.from(courseModules)
			.where(eq(courseModules.courseId, courseId))
		return Promise.all(rows.map(ModuleMapper.toDomain))
	}
}
