import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { CreateInstructorUseCase } from './create-instructor-use-case'
import { InstructorRepository } from '../../repositories/instructor-repository'
import { FakeIdGenerator } from '@/modules/auth-and-users/test/fake-id-generator'

describe('CreateInstructorUseCase', () => {
	let instructorRepo: InstructorRepository
	let sut: CreateInstructorUseCase

	beforeEach(() => {
		instructorRepo = mock(InstructorRepository)
		sut = new CreateInstructorUseCase({
			instructorRepository: instance(instructorRepo),
			idGenerator: new FakeIdGenerator(),
		})
	})

	it('should return success with created instructor', async () => {
		when(instructorRepo.save(anything())).thenResolve()

		const result = await sut.execute({
			email: 'instructor@example.com',
			passwordHash: 'hashed-password',
			name: 'Instructor User',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { instructor } = result.value
			expect(instructor.email).toBe('instructor@example.com')
			expect(instructor.name).toBe('Instructor User')
			expect(instructor.status).toBe('pending')
		}
	})
})
