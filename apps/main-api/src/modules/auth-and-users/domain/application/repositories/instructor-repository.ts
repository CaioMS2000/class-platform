import { UniqueId } from '@repo/core'
import { Instructor } from '../../models/instructor'
import type { InstructorStatus } from '../../models/@types'
import type { Pagination } from './params'

export type InstructorFilters = { status?: InstructorStatus }

export abstract class InstructorRepository {
	abstract save(instructor: Instructor): Promise<void>
	abstract update(instructor: Instructor): Promise<void>
	abstract delete(instructor: Instructor): Promise<void>
	abstract findById(id: UniqueId): Promise<Instructor | null>
	abstract getById(id: UniqueId): Promise<Instructor>
	abstract findByEmail(email: string): Promise<Instructor | null>
	abstract findMany(
		filters?: InstructorFilters,
		pagination?: Pagination
	): Promise<Instructor[]>
}
