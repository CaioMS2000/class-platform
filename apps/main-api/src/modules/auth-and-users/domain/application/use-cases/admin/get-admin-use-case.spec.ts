import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { GetAdminUseCase } from './get-admin-use-case'
import { AdminRepository } from '../../repositories/admin-repository'
import { AdminNotFoundError } from '../../@errors'
import { Admin } from '../../../models/admin'
import { FakeIdGenerator } from '@/modules/auth-and-users/test/fake-id-generator'

describe('GetAdminUseCase', () => {
	let adminRepo: AdminRepository
	let sut: GetAdminUseCase

	beforeEach(() => {
		adminRepo = mock(AdminRepository)
		sut = new GetAdminUseCase({ adminRepository: instance(adminRepo) })
	})

	it('should return failure when admin is not found', async () => {
		when(adminRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({ adminId: 'non-existent-id' })

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(AdminNotFoundError)
	})

	it('should return success with admin', async () => {
		const admin = await Admin.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				email: 'admin@example.com',
				passwordHash: 'hash',
				name: 'Admin',
			},
		})

		when(adminRepo.findById(anything())).thenResolve(admin)

		const result = await sut.execute({ adminId: admin.id.toString() })

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.admin.id.toString()).toBe(admin.id.toString())
		}
	})
})
