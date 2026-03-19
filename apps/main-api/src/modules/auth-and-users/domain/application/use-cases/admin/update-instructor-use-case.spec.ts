import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UpdateInstructorUseCase } from './update-instructor-use-case'
import { InstructorRepository } from '../../repositories/instructor-repository'
import { InstructorNotFoundError } from '../../@errors'
import { Instructor } from '../../../models/instructor'
import { FakeIdGenerator } from '@/modules/auth-and-users/test/fake-id-generator'

describe('UpdateInstructorUseCase', () => {
	let instructorRepo: InstructorRepository
	let sut: UpdateInstructorUseCase

	beforeEach(() => {
		instructorRepo = mock(InstructorRepository)
		sut = new UpdateInstructorUseCase({
			instructorRepository: instance(instructorRepo),
		})
	})

	it('should return failure when instructor is not found', async () => {
		when(instructorRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			instructorId: 'non-existent-id',
			name: 'New Name',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(InstructorNotFoundError)
	})

	it('should return success with updated instructor', async () => {
		const instructor = await Instructor.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				email: 'instructor@example.com',
				passwordHash: 'hash',
				name: 'Instructor',
			},
		})

		when(instructorRepo.findById(anything())).thenResolve(instructor)
		when(instructorRepo.update(anything())).thenResolve()

		const result = await sut.execute({
			instructorId: instructor.id.toString(),
			name: 'Updated Instructor',
			avatar: 'avatar.png',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.instructor.name).toBe('Updated Instructor')
			expect(result.value.instructor.avatar).toBe('avatar.png')
		}
	})
})
