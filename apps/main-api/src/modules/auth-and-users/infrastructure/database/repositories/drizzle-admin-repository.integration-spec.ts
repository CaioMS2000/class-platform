import { setupSchema, teardownSchema } from '@/test/setup-schema'
import { drizzle } from '@/lib/drizzle'
import { DrizzleAdminRepository } from './drizzle-admin-repository'
import { admins } from '../schema'
import { makeAdmin } from '@/modules/auth-and-users/test/factories/make-admin'
import { UniqueId } from '@repo/core'

describe('DrizzleAdminRepository', () => {
	const repo = new DrizzleAdminRepository()

	beforeAll(async () => {
		await setupSchema()
	})
	afterAll(async () => {
		await teardownSchema()
	})

	beforeEach(async () => {
		await drizzle.delete(admins)
	})

	describe('save', () => {
		it('should persist an admin', async () => {
			const admin = await makeAdmin()

			await repo.save(admin)

			const found = await repo.findById(admin.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(admin.id)
			expect(found!.email).toBe(admin.email)
			expect(found!.name).toBe(admin.name)
		})
	})

	describe('findById', () => {
		it('should return an admin by id', async () => {
			const admin = await makeAdmin()
			await repo.save(admin)

			const found = await repo.findById(admin.id)

			expect(found).not.toBeNull()
			expect(found!.id).toBe(admin.id)
		})

		it('should return null when admin does not exist', async () => {
			const found = await repo.findById(UniqueId('non-existent-id'))

			expect(found).toBeNull()
		})
	})

	describe('getById', () => {
		it('should return an admin by id', async () => {
			const admin = await makeAdmin()
			await repo.save(admin)

			const found = await repo.getById(admin.id)

			expect(found.id).toBe(admin.id)
		})

		it('should throw when admin does not exist', async () => {
			expect(async () => {
				await repo.getById(UniqueId('non-existent-id'))
			}).toThrow()
		})
	})

	describe('findByEmail', () => {
		it('should return an admin by email', async () => {
			const admin = await makeAdmin({ email: 'admin@test.com' })
			await repo.save(admin)

			const found = await repo.findByEmail('admin@test.com')

			expect(found).not.toBeNull()
			expect(found!.email).toBe('admin@test.com')
		})

		it('should return null when email does not exist', async () => {
			const found = await repo.findByEmail('nonexistent@test.com')

			expect(found).toBeNull()
		})
	})

	describe('findMany', () => {
		it('should return all admins when no filters are provided', async () => {
			const admin1 = await makeAdmin()
			const admin2 = await makeAdmin()
			await repo.save(admin1)
			await repo.save(admin2)

			const result = await repo.findMany()

			expect(result).toHaveLength(2)
		})

		it('should filter admins by status', async () => {
			const activeAdmin = await makeAdmin({ status: 'active' })
			const pendingAdmin = await makeAdmin({ status: 'pending' })
			await repo.save(activeAdmin)
			await repo.save(pendingAdmin)

			const result = await repo.findMany({ status: 'active' })

			expect(result).toHaveLength(1)
			expect(result[0]!.id).toBe(activeAdmin.id)
		})

		it('should paginate results', async () => {
			const admin1 = await makeAdmin()
			const admin2 = await makeAdmin()
			const admin3 = await makeAdmin()
			await repo.save(admin1)
			await repo.save(admin2)
			await repo.save(admin3)

			const page1 = await repo.findMany(undefined, { page: 1, limit: 2 })
			const page2 = await repo.findMany(undefined, { page: 2, limit: 2 })

			expect(page1).toHaveLength(2)
			expect(page2).toHaveLength(1)
		})
	})

	describe('update', () => {
		it('should update an admin', async () => {
			const admin = await makeAdmin()
			await repo.save(admin)

			const updated = admin.update({ name: 'Updated Name' })
			await repo.update(updated)

			const found = await repo.findById(admin.id)
			expect(found).not.toBeNull()
			expect(found!.name).toBe('Updated Name')
		})
	})

	describe('delete', () => {
		it('should delete an admin', async () => {
			const admin = await makeAdmin()
			await repo.save(admin)

			await repo.delete(admin)

			const found = await repo.findById(admin.id)
			expect(found).toBeNull()
		})
	})
})
