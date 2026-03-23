import type { UniqueId } from '@repo/core'
import { Instructor } from '../../../domain/models/instructor'
import type { instructors } from '../schema'
import { nullIdGenerator } from '../repositories/null-id-generator'

type Row = typeof instructors.$inferSelect
type InsertRow = typeof instructors.$inferInsert

export class InstructorMapper {
	static async toDomain(row: Row): Promise<Instructor> {
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

	static toPersistence(instructor: Instructor): InsertRow {
		return {
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
		}
	}
}
