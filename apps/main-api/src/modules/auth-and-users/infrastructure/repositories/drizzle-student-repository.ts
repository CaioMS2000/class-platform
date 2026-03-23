import { eq, and } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { type UniqueId } from '@repo/core'
import {
	StudentRepository,
	type StudentFilters,
} from '../../domain/application/repositories/student-repository'
import type { Pagination } from '../../domain/application/repositories/params'
import { Student } from '../../domain/models/student'
import { students } from '../database/schema'
import { nullIdGenerator } from './null-id-generator'

type Row = typeof students.$inferSelect

async function toStudent(row: Row): Promise<Student> {
	return Student.create({
		idGenerator: nullIdGenerator,
		id: row.id as UniqueId,
		input: {
			email: row.email,
			passwordHash: row.passwordHash,
			name: row.name,
			avatar: row.avatar ?? undefined,
			status: row.status,
			emailVerifiedAt: row.emailVerifiedAt ?? undefined,
			lastLoginAt: row.lastLoginAt ?? undefined,
			lastLoginIp: row.lastLoginIp ?? undefined,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		},
	})
}

export class DrizzleStudentRepository extends StudentRepository {
	constructor(private readonly db: NodePgDatabase) {
		super()
	}

	async save(student: Student): Promise<void> {
		await this.db.insert(students).values({
			id: student.id,
			email: student.email,
			passwordHash: student.passwordHash,
			name: student.name,
			avatar: student.avatar,
			status: student.status,
			emailVerifiedAt: student.emailVerifiedAt,
			lastLoginAt: student.lastLoginAt,
			lastLoginIp: student.lastLoginIp,
			createdAt: student.createdAt,
			updatedAt: student.updatedAt,
		})
	}

	async update(student: Student): Promise<void> {
		await this.db
			.update(students)
			.set({
				email: student.email,
				passwordHash: student.passwordHash,
				name: student.name,
				avatar: student.avatar,
				status: student.status,
				emailVerifiedAt: student.emailVerifiedAt,
				lastLoginAt: student.lastLoginAt,
				lastLoginIp: student.lastLoginIp,
				updatedAt: student.updatedAt,
			})
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
		return toStudent(row)
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
		return toStudent(row)
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
		return Promise.all(rows.map(toStudent))
	}
}
