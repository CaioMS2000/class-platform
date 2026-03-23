import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { GetStudentByAdminUseCase } from './get-student-by-admin-use-case'
import { StudentRepository } from '../../repositories/student-repository'
import { StudentNotFoundError } from '../../@errors'
import { Student } from '../../../models/student'
import { FakeIdGenerator } from '@/modules/auth-and-users/test/fake-id-generator'

describe('GetStudentByAdminUseCase', () => {
	let studentRepo: StudentRepository
	let sut: GetStudentByAdminUseCase

	beforeEach(() => {
		studentRepo = mock(StudentRepository)
		sut = new GetStudentByAdminUseCase({
			studentRepository: instance(studentRepo),
		})
	})

	it('should return failure when student is not found', async () => {
		when(studentRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({ studentId: 'non-existent-id' })

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(StudentNotFoundError)
	})

	it('should return success with student', async () => {
		const student = await Student.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				email: 'student@example.com',
				passwordHash: 'hash',
				name: 'Student',
			},
		})

		when(studentRepo.findById(anything())).thenResolve(student)

		const result = await sut.execute({ studentId: student.id.toString() })

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.student.id.toString()).toBe(student.id.toString())
		}
	})
})
