import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { CreateStudentUseCase } from './create-student-use-case'
import { StudentRepository } from '../../repositories/student-repository'
import { FakeIdGenerator } from '@/modules/auth-and-users/test/fake-id-generator'

describe('CreateStudentUseCase', () => {
	let studentRepo: StudentRepository
	let sut: CreateStudentUseCase

	beforeEach(() => {
		studentRepo = mock(StudentRepository)
		sut = new CreateStudentUseCase({
			studentRepository: instance(studentRepo),
			idGenerator: new FakeIdGenerator(),
		})
	})

	it('should return success with created student', async () => {
		when(studentRepo.save(anything())).thenResolve()

		const result = await sut.execute({
			email: 'student@example.com',
			passwordHash: 'hashed-password',
			name: 'Student User',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { student } = result.value
			expect(student.email).toBe('student@example.com')
			expect(student.name).toBe('Student User')
			expect(student.status).toBe('pending')
		}
	})
})
