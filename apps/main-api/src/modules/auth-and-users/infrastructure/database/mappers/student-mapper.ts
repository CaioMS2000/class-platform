import type { UniqueId } from '@repo/core'
import { Student } from '../../../domain/models/student'
import type { students } from '../schema'
import { nullIdGenerator } from '../repositories/null-id-generator'

type Row = typeof students.$inferSelect
type InsertRow = typeof students.$inferInsert

export class StudentMapper {
	static async toDomain(row: Row): Promise<Student> {
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

	static toPersistence(student: Student): InsertRow {
		return {
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
		}
	}
}
