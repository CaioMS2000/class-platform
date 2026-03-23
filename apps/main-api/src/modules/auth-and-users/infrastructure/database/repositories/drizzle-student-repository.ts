import { eq, and } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { UniqueId } from '@repo/core'
import {
	StudentRepository,
	type StudentFilters,
} from '../../../domain/application/repositories/student-repository'
import type { Pagination } from '../../../domain/application/repositories/params'
import type { Student } from '../../../domain/models/student'
import { students } from '../schema'
import { StudentMapper } from '../mappers/student-mapper'

export class DrizzleStudentRepository extends StudentRepository {
	constructor(private readonly db: NodePgDatabase) {
		super()
	}

	async save(student: Student): Promise<void> {
		await this.db.insert(students).values(StudentMapper.toPersistence(student))
	}

	async update(student: Student): Promise<void> {
		const { id, createdAt, ...updateData } =
			StudentMapper.toPersistence(student)
		await this.db
			.update(students)
			.set(updateData)
			.where(eq(students.id, student.id))
	}

	async delete(student: Student): Promise<void> {
		await this.db.delete(students).where(eq(students.id, student.id))
	}

	async findById(id: UniqueId): Promise<Student | null> {
		const [row] = await this.db
			.select()
			.from(students)
			.where(eq(students.id, id))
		if (!row) return null
		return StudentMapper.toDomain(row)
	}

	async getById(id: UniqueId): Promise<Student> {
		const student = await this.findById(id)
		if (!student) throw new Error(`Student not found: ${id}`)
		return student
	}

	async findByEmail(email: string): Promise<Student | null> {
		const [row] = await this.db
			.select()
			.from(students)
			.where(eq(students.email, email))
		if (!row) return null
		return StudentMapper.toDomain(row)
	}

	async findMany(
		filters?: StudentFilters,
		pagination?: Pagination
	): Promise<Student[]> {
		const conditions = []
		if (filters?.status) {
			conditions.push(eq(students.status, filters.status))
		}

		let query = this.db
			.select()
			.from(students)
			.where(conditions.length ? and(...conditions) : undefined)
			.$dynamic()

		if (pagination?.limit !== undefined) {
			query = query.limit(pagination.limit)
			if (pagination.page !== undefined) {
				query = query.offset((pagination.page - 1) * pagination.limit)
			}
		}

		const rows = await query
		return Promise.all(rows.map(row => StudentMapper.toDomain(row)))
	}
}
