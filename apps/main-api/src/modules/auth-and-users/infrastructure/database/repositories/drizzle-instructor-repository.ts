import { eq, and } from 'drizzle-orm'
import { drizzle } from '@/lib/drizzle'
import type { UniqueId } from '@repo/core'
import {
	InstructorRepository,
	type InstructorFilters,
} from '../../../domain/application/repositories/instructor-repository'
import type { Pagination } from '../../../domain/application/repositories/params'
import type { Instructor } from '../../../domain/models/instructor'
import { instructors } from '../schema'
import { InstructorMapper } from '../mappers/instructor-mapper'

export class DrizzleInstructorRepository extends InstructorRepository {
	async save(instructor: Instructor): Promise<void> {
		await drizzle
			.insert(instructors)
			.values(InstructorMapper.toPersistence(instructor))
	}

	async update(instructor: Instructor): Promise<void> {
		const { id, createdAt, ...updateData } =
			InstructorMapper.toPersistence(instructor)
		await drizzle
			.update(instructors)
			.set(updateData)
			.where(eq(instructors.id, instructor.id))
	}

	async delete(instructor: Instructor): Promise<void> {
		await drizzle.delete(instructors).where(eq(instructors.id, instructor.id))
	}

	async findById(id: UniqueId): Promise<Instructor | null> {
		const [row] = await drizzle
			.select()
			.from(instructors)
			.where(eq(instructors.id, id))
		if (!row) return null
		return InstructorMapper.toDomain(row)
	}

	async getById(id: UniqueId): Promise<Instructor> {
		const instructor = await this.findById(id)
		if (!instructor) throw new Error(`Instructor not found: ${id}`)
		return instructor
	}

	async findByEmail(email: string): Promise<Instructor | null> {
		const [row] = await drizzle
			.select()
			.from(instructors)
			.where(eq(instructors.email, email))
		if (!row) return null
		return InstructorMapper.toDomain(row)
	}

	async findMany(
		filters?: InstructorFilters,
		pagination?: Pagination
	): Promise<Instructor[]> {
		const conditions = []
		if (filters?.status) {
			conditions.push(eq(instructors.status, filters.status))
		}

		let query = drizzle
			.select()
			.from(instructors)
			.where(conditions.length ? and(...conditions) : undefined)
			.$dynamic()

		if (pagination?.limit !== undefined) {
			query = query.limit(pagination.limit)
			if (pagination.page !== undefined) {
				query = query.offset((pagination.page - 1) * pagination.limit)
			}
		}

		const rows = await query
		return Promise.all(rows.map(row => InstructorMapper.toDomain(row)))
	}
}
