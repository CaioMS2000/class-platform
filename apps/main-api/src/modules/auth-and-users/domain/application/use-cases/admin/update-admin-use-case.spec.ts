import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UpdateAdminUseCase } from './update-admin-use-case'
import { AdminRepository } from '../../repositories/admin-repository'
import { AdminNotFoundError } from '../../@errors'
import { Admin } from '../../../models/admin'
import { FakeIdGenerator } from '@/modules/auth-and-users/test/fake-id-generator'

describe('UpdateAdminUseCase', () => {
	let adminRepo: AdminRepository
	let sut: UpdateAdminUseCase

	beforeEach(() => {
		adminRepo = mock(AdminRepository)
		sut = new UpdateAdminUseCase({ adminRepository: instance(adminRepo) })
	})

	it('should return failure when admin is not found', async () => {
		when(adminRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			adminId: 'non-existent-id',
			name: 'New Name',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(AdminNotFoundError)
	})

	it('should return success with updated admin', async () => {
		const admin = await Admin.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				email: 'admin@example.com',
				passwordHash: 'hash',
				name: 'Admin',
			},
		})

		when(adminRepo.findById(anything())).thenResolve(admin)
		when(adminRepo.update(anything())).thenResolve()

		const result = await sut.execute({
			adminId: admin.id.toString(),
			name: 'Updated Admin',
			avatar: 'avatar.png',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.admin.name).toBe('Updated Admin')
			expect(result.value.admin.avatar).toBe('avatar.png')
		}
	})
})
