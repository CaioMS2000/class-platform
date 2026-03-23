import { eq, and } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { type UniqueId } from '@repo/core'
import {
	InstructorRepository,
	type InstructorFilters,
} from '../../domain/application/repositories/instructor-repository'
import type { Pagination } from '../../domain/application/repositories/params'
import { Instructor } from '../../domain/models/instructor'
import { instructors } from '../database/schema'
import { nullIdGenerator } from './null-id-generator'

type Row = typeof instructors.$inferSelect

async function toInstructor(row: Row): Promise<Instructor> {
	return Instructor.create({
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

export class DrizzleInstructorRepository extends InstructorRepository {
	constructor(private readonly db: NodePgDatabase) {
		super()
	}

	async save(instructor: Instructor): Promise<void> {
		await this.db.insert(instructors).values({
			id: instructor.id,
			email: instructor.email,
			passwordHash: instructor.passwordHash,
			name: instructor.name,
			avatar: instructor.avatar,
			status: instructor.status,
			emailVerifiedAt: instructor.emailVerifiedAt,
			lastLoginAt: instructor.lastLoginAt,
			lastLoginIp: instructor.lastLoginIp,
			createdAt: instructor.createdAt,
			updatedAt: instructor.updatedAt,
		})
	}

	async update(instructor: Instructor): Promise<void> {
		await this.db
			.update(instructors)
			.set({
				email: instructor.email,
				passwordHash: instructor.passwordHash,
				name: instructor.name,
				avatar: instructor.avatar,
				status: instructor.status,
				emailVerifiedAt: instructor.emailVerifiedAt,
				lastLoginAt: instructor.lastLoginAt,
				lastLoginIp: instructor.lastLoginIp,
				updatedAt: instructor.updatedAt,
			})
			.where(eq(instructors.id, instructor.id))
	}

	async delete(instructor: Instructor): Promise<void> {
		await this.db.delete(instructors).where(eq(instructors.id, instructor.id))
	}

	async findById(id: UniqueId): Promise<Instructor | null> {
		const [row] = await this.db
			.select()
			.from(instructors)
			.where(eq(instructors.id, id))
		if (!row) return null
		return toInstructor(row)
	}

	async getById(id: UniqueId): Promise<Instructor> {
		const instructor = await this.findById(id)
		if (!instructor) throw new Error(`Instructor not found: ${id}`)
		return instructor
	}

	async findByEmail(email: string): Promise<Instructor | null> {
		const [row] = await this.db
			.select()
			.from(instructors)
			.where(eq(instructors.email, email))
		if (!row) return null
		return toInstructor(row)
	}

	async findMany(
		filters?: InstructorFilters,
		pagination?: Pagination
	): Promise<Instructor[]> {
		const conditions = []
		if (filters?.status) {
			conditions.push(eq(instructors.status, filters.status))
		}

		let query = this.db
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
		return Promise.all(rows.map(toInstructor))
	}
}
