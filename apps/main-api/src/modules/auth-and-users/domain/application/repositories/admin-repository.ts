import { UniqueId } from '@repo/core'
import { Admin } from '../../models/admin'
import type { AdminStatus } from '../../models/@types'
import type { Pagination } from './params'

export type AdminFilters = { status?: AdminStatus }

export abstract class AdminRepository {
	abstract save(admin: Admin): Promise<void>
	abstract update(admin: Admin): Promise<void>
	abstract delete(admin: Admin): Promise<void>
	abstract findById(id: UniqueId): Promise<Admin | null>
	abstract getById(id: UniqueId): Promise<Admin>
	abstract findByEmail(email: string): Promise<Admin | null>
	abstract findMany(
		filters?: AdminFilters,
		pagination?: Pagination
	): Promise<Admin[]>
}
