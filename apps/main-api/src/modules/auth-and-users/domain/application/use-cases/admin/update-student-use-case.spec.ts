import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UpdateStudentUseCase } from './update-student-use-case'
import { StudentRepository } from '../../repositories/student-repository'
import { StudentNotFoundError } from '../../@errors'
import { Student } from '../../../models/student'
import { FakeIdGenerator } from '@/modules/auth-and-users/test/fake-id-generator'

describe('UpdateStudentUseCase', () => {
	let studentRepo: StudentRepository
	let sut: UpdateStudentUseCase

	beforeEach(() => {
		studentRepo = mock(StudentRepository)
		sut = new UpdateStudentUseCase({ studentRepository: instance(studentRepo) })
	})

	it('should return failure when student is not found', async () => {
		when(studentRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			studentId: 'non-existent-id',
			name: 'New Name',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(StudentNotFoundError)
	})

	it('should return success with updated student', async () => {
		const student = await Student.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				email: 'student@example.com',
				passwordHash: 'hash',
				name: 'Student',
			},
		})

		when(studentRepo.findById(anything())).thenResolve(student)
		when(studentRepo.update(anything())).thenResolve()

		const result = await sut.execute({
			studentId: student.id.toString(),
			name: 'Updated Student',
			avatar: 'avatar.png',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.student.name).toBe('Updated Student')
			expect(result.value.student.avatar).toBe('avatar.png')
		}
	})
})
