import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { DeleteInstructorUseCase } from './delete-instructor-use-case'
import { InstructorRepository } from '../repositories/instructor-repository'
import { InstructorNotFoundError } from '../@errors'
import { Instructor } from '../../models/instructor'
import { FakeIdGenerator } from '@/modules/auth-and-users/test/fake-id-generator'

describe('DeleteInstructorUseCase', () => {
	let instructorRepo: InstructorRepository
	let sut: DeleteInstructorUseCase

	beforeEach(() => {
		instructorRepo = mock(InstructorRepository)
		sut = new DeleteInstructorUseCase({
			instructorRepository: instance(instructorRepo),
		})
	})

	it('should return failure when instructor is not found', async () => {
		when(instructorRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({ instructorId: 'non-existent-id' })

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(InstructorNotFoundError)
	})

	it('should return success and delete instructor', async () => {
		const instructor = await Instructor.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				email: 'instructor@example.com',
				passwordHash: 'hash',
				name: 'Instructor',
			},
		})

		when(instructorRepo.findById(anything())).thenResolve(instructor)
		when(instructorRepo.delete(anything())).thenResolve()

		const result = await sut.execute({ instructorId: instructor.id.toString() })

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value).toBeNull()
		}
	})
})
