import { UniqueId } from '@repo/core'
import { Student } from '../../models/student'
import type { StudentStatus } from '../../models/@types'
import type { Pagination } from './params'

export type StudentFilters = { status?: StudentStatus }

export abstract class StudentRepository {
	abstract save(student: Student): Promise<void>
	abstract update(student: Student): Promise<void>
	abstract delete(student: Student): Promise<void>
	abstract findById(id: UniqueId): Promise<Student | null>
	abstract getById(id: UniqueId): Promise<Student>
	abstract findByEmail(email: string): Promise<Student | null>
	abstract findMany(
		filters?: StudentFilters,
		pagination?: Pagination
	): Promise<Student[]>
}
