import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { CreateAdminUseCase } from './create-admin-use-case'
import { AdminRepository } from '../../repositories/admin-repository'
import { FakeIdGenerator } from '@/modules/auth-and-users/test/fake-id-generator'

describe('CreateAdminUseCase', () => {
	let adminRepo: AdminRepository
	let sut: CreateAdminUseCase

	beforeEach(() => {
		adminRepo = mock(AdminRepository)
		sut = new CreateAdminUseCase({
			adminRepository: instance(adminRepo),
			idGenerator: new FakeIdGenerator(),
		})
	})

	it('should return success with created admin', async () => {
		when(adminRepo.save(anything())).thenResolve()

		const result = await sut.execute({
			email: 'admin@example.com',
			passwordHash: 'hashed-password',
			name: 'Admin User',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { admin } = result.value
			expect(admin.email).toBe('admin@example.com')
			expect(admin.name).toBe('Admin User')
			expect(admin.status).toBe('pending')
		}
	})
})
