import { eq, and } from 'drizzle-orm'
import { drizzle } from '@/lib/drizzle'
import type { UniqueId } from '@repo/core'
import {
	AdminRepository,
	type AdminFilters,
} from '../../../domain/application/repositories/admin-repository'
import type { Pagination } from '../../../domain/application/repositories/params'
import type { Admin } from '../../../domain/models/admin'
import { admins } from '../schema'
import { AdminMapper } from '../mappers/admin-mapper'

export class DrizzleAdminRepository extends AdminRepository {
	async save(admin: Admin): Promise<void> {
		await drizzle.insert(admins).values(AdminMapper.toPersistence(admin))
	}

	async update(admin: Admin): Promise<void> {
		const { id, createdAt, ...updateData } = AdminMapper.toPersistence(admin)
		await drizzle.update(admins).set(updateData).where(eq(admins.id, admin.id))
	}

	async delete(admin: Admin): Promise<void> {
		await drizzle.delete(admins).where(eq(admins.id, admin.id))
	}

	async findById(id: UniqueId): Promise<Admin | null> {
		const [row] = await drizzle.select().from(admins).where(eq(admins.id, id))
		if (!row) return null
		return AdminMapper.toDomain(row)
	}

	async getById(id: UniqueId): Promise<Admin> {
		const admin = await this.findById(id)
		if (!admin) throw new Error(`Admin not found: ${id}`)
		return admin
	}

	async findByEmail(email: string): Promise<Admin | null> {
		const [row] = await drizzle
			.select()
			.from(admins)
			.where(eq(admins.email, email))
		if (!row) return null
		return AdminMapper.toDomain(row)
	}

	async findMany(
		filters?: AdminFilters,
		pagination?: Pagination
	): Promise<Admin[]> {
		const conditions = []
		if (filters?.status) {
			conditions.push(eq(admins.status, filters.status))
		}

		let query = drizzle
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
		return Promise.all(rows.map(row => AdminMapper.toDomain(row)))
	}
}
