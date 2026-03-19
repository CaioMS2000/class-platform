import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { DeleteStudentUseCase } from './delete-student-use-case'
import { StudentRepository } from '../../repositories/student-repository'
import { StudentNotFoundError } from '../../@errors'
import { Student } from '../../../models/student'
import { FakeIdGenerator } from '@/modules/auth-and-users/test/fake-id-generator'

describe('DeleteStudentUseCase', () => {
	let studentRepo: StudentRepository
	let sut: DeleteStudentUseCase

	beforeEach(() => {
		studentRepo = mock(StudentRepository)
		sut = new DeleteStudentUseCase({ studentRepository: instance(studentRepo) })
	})

	it('should return failure when student is not found', async () => {
		when(studentRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({ studentId: 'non-existent-id' })

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(StudentNotFoundError)
	})

	it('should return success and delete student', async () => {
		const student = await Student.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				email: 'student@example.com',
				passwordHash: 'hash',
				name: 'Student',
			},
		})

		when(studentRepo.findById(anything())).thenResolve(student)
		when(studentRepo.delete(anything())).thenResolve()

		const result = await sut.execute({ studentId: student.id.toString() })

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value).toBeNull()
		}
	})
})
