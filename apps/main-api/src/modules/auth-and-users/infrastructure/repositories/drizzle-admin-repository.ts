import { eq, and } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { type UniqueId } from '@repo/core'
import {
	AdminRepository,
	type AdminFilters,
} from '../../domain/application/repositories/admin-repository'
import type { Pagination } from '../../domain/application/repositories/params'
import { Admin } from '../../domain/models/admin'
import { admins } from '../database/schema'
import { nullIdGenerator } from './null-id-generator'

type Row = typeof admins.$inferSelect

async function toAdmin(row: Row): Promise<Admin> {
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

export class DrizzleAdminRepository extends AdminRepository {
	constructor(private readonly db: NodePgDatabase) {
		super()
	}

	async save(admin: Admin): Promise<void> {
		await this.db.insert(admins).values({
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
		})
	}

	async update(admin: Admin): Promise<void> {
		await this.db
			.update(admins)
			.set({
				email: admin.email,
				passwordHash: admin.passwordHash,
				name: admin.name,
				avatar: admin.avatar,
				status: admin.status,
				emailVerifiedAt: admin.emailVerifiedAt,
				lastLoginAt: admin.lastLoginAt,
				lastLoginIp: admin.lastLoginIp,
				updatedAt: admin.updatedAt,
			})
			.where(eq(admins.id, admin.id))
	}

	async delete(admin: Admin): Promise<void> {
		await this.db.delete(admins).where(eq(admins.id, admin.id))
	}

	async findById(id: UniqueId): Promise<Admin | null> {
		const [row] = await this.db.select().from(admins).where(eq(admins.id, id))
		if (!row) return null
		return toAdmin(row)
	}

	async getById(id: UniqueId): Promise<Admin> {
		const admin = await this.findById(id)
		if (!admin) throw new Error(`Admin not found: ${id}`)
		return admin
	}

	async findByEmail(email: string): Promise<Admin | null> {
		const [row] = await this.db
			.select()
			.from(admins)
			.where(eq(admins.email, email))
		if (!row) return null
		return toAdmin(row)
	}

	async findMany(
		filters?: AdminFilters,
		pagination?: Pagination
	): Promise<Admin[]> {
		const conditions = []
		if (filters?.status) {
			conditions.push(eq(admins.status, filters.status))
		}

		let query = this.db
			.select()
			.from(admins)
			.where(conditions.length ? and(...conditions) : undefined)
			.$dynamic()

		if (pagination?.limit !== undefined) {
			query = query.limit(pagination.limit)
			if (pagination.page !== undefined) {
				query = query.offset((pagination.page - 1) * pagination.limit)
			}
		}

		const rows = await query
		return Promise.all(rows.map(toAdmin))
	}
}
