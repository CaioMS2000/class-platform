import type { UniqueId } from '@repo/core'
import { Student } from '../../../domain/models/student'
import { nullIdGenerator } from '@/modules/auth-and-users/infrastructure/database/repositories/null-id-generator'
import type { students } from '@/modules/auth-and-users/infrastructure/database/schema'

type Row = typeof students.$inferSelect

export class StudentMapper {
	static async toDomain(row: Row): Promise<Student> {
		return Student.create({
			idGenerator: nullIdGenerator,
			id: row.id as UniqueId,
			input: {
				email: row.email,
				name: row.name,
				avatar: row.avatar ?? undefined,
				emailVerifiedAt: row.emailVerifiedAt ?? undefined,
				lastLoginAt: row.lastLoginAt ?? undefined,
				lastLoginIp: row.lastLoginIp ?? undefined,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
			},
		})
	}

	static toPersistence(student: Student) {
		return {
			id: student.id,
			email: student.email,
			name: student.name,
			avatar: student.avatar,
			emailVerifiedAt: student.emailVerifiedAt,
			lastLoginAt: student.lastLoginAt,
			lastLoginIp: student.lastLoginIp,
			createdAt: student.createdAt,
			updatedAt: student.updatedAt,
		}
	}
}
