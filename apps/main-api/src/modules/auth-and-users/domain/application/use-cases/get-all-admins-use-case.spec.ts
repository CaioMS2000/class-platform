import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { GetAllAdminsUseCase } from './get-all-admins-use-case'
import { AdminRepository } from '../repositories/admin-repository'
import { Admin } from '../../models/admin'
import { FakeIdGenerator } from '@/modules/auth-and-users/test/fake-id-generator'

describe('GetAllAdminsUseCase', () => {
	let adminRepo: AdminRepository
	let sut: GetAllAdminsUseCase

	beforeEach(() => {
		adminRepo = mock(AdminRepository)
		sut = new GetAllAdminsUseCase({ adminRepository: instance(adminRepo) })
	})

	it('should return success with admins list', async () => {
		const admin1 = await Admin.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				email: 'admin1@example.com',
				passwordHash: 'hash',
				name: 'Admin 1',
			},
		})
		const admin2 = await Admin.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				email: 'admin2@example.com',
				passwordHash: 'hash',
				name: 'Admin 2',
			},
		})

		when(adminRepo.findMany(anything(), anything())).thenResolve([
			admin1,
			admin2,
		])

		const result = await sut.execute({})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.admins).toHaveLength(2)
			expect(result.value.admins[0].name).toBe('Admin 1')
			expect(result.value.admins[1].name).toBe('Admin 2')
		}
	})
})
