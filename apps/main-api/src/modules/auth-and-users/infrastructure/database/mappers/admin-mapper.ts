import type { UniqueId } from '@repo/core'
import { Admin } from '../../../domain/models/admin'
import type { admins } from '../schema'
import { nullIdGenerator } from '../repositories/null-id-generator'

type Row = typeof admins.$inferSelect
type InsertRow = typeof admins.$inferInsert

export class AdminMapper {
	static async toDomain(row: Row): Promise<Admin> {
		return Admin.create({
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

	static toPersistence(admin: Admin): InsertRow {
		return {
			id: admin.id,
			email: admin.email,
			passwordHash: admin.passwordHash,
			name: admin.name,
			avatar: admin.avatar,
			status: admin.status,
			emailVerifiedAt: admin.emailVerifiedAt,
			lastLoginAt: admin.lastLoginAt,
			lastLoginIp: admin.lastLoginIp,
			createdAt: admin.createdAt,
			updatedAt: admin.updatedAt,
		}
	}
}
