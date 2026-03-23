import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { GetAllStudentsUseCase } from './get-all-students-use-case'
import { StudentRepository } from '../../repositories/student-repository'
import { Student } from '../../../models/student'
import { FakeIdGenerator } from '@/modules/auth-and-users/test/fake-id-generator'

describe('GetAllStudentsUseCase', () => {
	let studentRepo: StudentRepository
	let sut: GetAllStudentsUseCase

	beforeEach(() => {
		studentRepo = mock(StudentRepository)
		sut = new GetAllStudentsUseCase({
			studentRepository: instance(studentRepo),
		})
	})

	it('should return success with students list', async () => {
		const student1 = await Student.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				email: 'student1@example.com',
				passwordHash: 'hash',
				name: 'Student 1',
			},
		})
		const student2 = await Student.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				email: 'student2@example.com',
				passwordHash: 'hash',
				name: 'Student 2',
			},
		})

		when(studentRepo.findMany(anything(), anything())).thenResolve([
			student1,
			student2,
		])

		const result = await sut.execute({})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.students).toHaveLength(2)
			expect(result.value.students[0]?.name).toBe('Student 1')
			expect(result.value.students[1]?.name).toBe('Student 2')
		}
	})
})
