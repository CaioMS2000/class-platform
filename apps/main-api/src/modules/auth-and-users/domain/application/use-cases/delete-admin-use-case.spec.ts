import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { DeleteAdminUseCase } from './delete-admin-use-case'
import { AdminRepository } from '../repositories/admin-repository'
import { AdminNotFoundError } from '../@errors'
import { Admin } from '../../models/admin'
import { FakeIdGenerator } from '@/modules/auth-and-users/test/fake-id-generator'

describe('DeleteAdminUseCase', () => {
	let adminRepo: AdminRepository
	let sut: DeleteAdminUseCase

	beforeEach(() => {
		adminRepo = mock(AdminRepository)
		sut = new DeleteAdminUseCase({ adminRepository: instance(adminRepo) })
	})

	it('should return failure when admin is not found', async () => {
		when(adminRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({ adminId: 'non-existent-id' })

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(AdminNotFoundError)
	})

	it('should return success and delete admin', async () => {
		const admin = await Admin.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				email: 'admin@example.com',
				passwordHash: 'hash',
				name: 'Admin',
			},
		})

		when(adminRepo.findById(anything())).thenResolve(admin)
		when(adminRepo.delete(anything())).thenResolve()

		const result = await sut.execute({ adminId: admin.id.toString() })

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value).toBeNull()
		}
	})
})
