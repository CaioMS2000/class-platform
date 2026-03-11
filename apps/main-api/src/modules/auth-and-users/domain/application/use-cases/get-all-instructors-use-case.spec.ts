import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { GetAllInstructorsUseCase } from './get-all-instructors-use-case'
import { InstructorRepository } from '../repositories/instructor-repository'
import { Instructor } from '../../models/instructor'
import { FakeIdGenerator } from '@/modules/auth-and-users/test/fake-id-generator'

describe('GetAllInstructorsUseCase', () => {
	let instructorRepo: InstructorRepository
	let sut: GetAllInstructorsUseCase

	beforeEach(() => {
		instructorRepo = mock(InstructorRepository)
		sut = new GetAllInstructorsUseCase({
			instructorRepository: instance(instructorRepo),
		})
	})

	it('should return success with instructors list', async () => {
		const instructor1 = await Instructor.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				email: 'instructor1@example.com',
				passwordHash: 'hash',
				name: 'Instructor 1',
			},
		})
		const instructor2 = await Instructor.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				email: 'instructor2@example.com',
				passwordHash: 'hash',
				name: 'Instructor 2',
			},
		})

		when(instructorRepo.findMany(anything(), anything())).thenResolve([
			instructor1,
			instructor2,
		])

		const result = await sut.execute({})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.instructors).toHaveLength(2)
			expect(result.value.instructors[0].name).toBe('Instructor 1')
			expect(result.value.instructors[1].name).toBe('Instructor 2')
		}
	})
})
