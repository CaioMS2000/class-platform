import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { UniqueId } from '@repo/core'
import { ListStudentEnrollmentsUseCase } from './list-student-enrollments-use-case'
import { StudentRepository } from '../repositories/student-repository'
import { EnrollmentRepository } from '../repositories/enrollment-repository'
import { StudentNotFoundError } from '../@errors'
import { Student } from '../../domain/models/student'
import { Enrollment } from '../../domain/models/enrollment'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('ListStudentEnrollmentsUseCase', () => {
	let studentRepo: StudentRepository
	let enrollmentRepo: EnrollmentRepository
	let idGenerator: FakeIdGenerator
	let sut: ListStudentEnrollmentsUseCase

	beforeEach(() => {
		studentRepo = mock(StudentRepository)
		enrollmentRepo = mock(EnrollmentRepository)
		idGenerator = new FakeIdGenerator()
		sut = new ListStudentEnrollmentsUseCase({
			studentRepository: instance(studentRepo),
			enrollmentRepository: instance(enrollmentRepo),
		})
	})

	it('should return failure when student is not found', async () => {
		when(studentRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({ studentId: 'non-existent' })

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(StudentNotFoundError)
	})

	it('should return success with empty array when student has no enrollments', async () => {
		const student = await Student.create({
			idGenerator,
			input: { email: 'student@test.com', name: 'Test Student' },
		})

		when(studentRepo.findById(anything())).thenResolve(student)
		when(enrollmentRepo.findManyByStudent(anything())).thenResolve([])

		const result = await sut.execute({ studentId: student.id.toString() })

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.enrollments).toHaveLength(0)
		}
	})

	it('should return success with list of enrollments', async () => {
		const student = await Student.create({
			idGenerator,
			input: { email: 'student@test.com', name: 'Test Student' },
		})
		const enrollment1 = await Enrollment.create({
			idGenerator,
			input: {
				userId: student.id,
				courseId: UniqueId('course-1'),
				totalLessons: 5,
			},
		})
		const enrollment2 = await Enrollment.create({
			idGenerator,
			input: {
				userId: student.id,
				courseId: UniqueId('course-2'),
				totalLessons: 8,
			},
		})

		when(studentRepo.findById(anything())).thenResolve(student)
		when(enrollmentRepo.findManyByStudent(anything())).thenResolve([
			enrollment1,
			enrollment2,
		])

		const result = await sut.execute({ studentId: student.id.toString() })

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.enrollments).toHaveLength(2)
		}
	})
})
