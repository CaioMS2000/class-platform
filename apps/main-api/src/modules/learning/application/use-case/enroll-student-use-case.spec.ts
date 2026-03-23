import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { UniqueId } from '@repo/core'
import { EnrollStudentUseCase } from './enroll-student-use-case'
import { CourseRepository } from '../repositories/course-repository'
import { StudentRepository } from '../repositories/student-repository'
import { EnrollmentRepository } from '../repositories/enrollment-repository'
import { CourseNotFoundError, StudentNotFoundError } from '../@errors'
import { StudentAlreadyEnrolledError } from '../../domain/@errors/student-already-enrolled-error'
import { Course } from '../../domain/models/course'
import { Student } from '../../domain/models/student'
import { Enrollment } from '../../domain/models/enrollment'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('EnrollStudentUseCase', () => {
	let studentRepo: StudentRepository
	let courseRepo: CourseRepository
	let enrollmentRepo: EnrollmentRepository
	let idGenerator: FakeIdGenerator
	let sut: EnrollStudentUseCase

	beforeEach(() => {
		studentRepo = mock(StudentRepository)
		courseRepo = mock(CourseRepository)
		enrollmentRepo = mock(EnrollmentRepository)
		idGenerator = new FakeIdGenerator()
		sut = new EnrollStudentUseCase({
			idGenerator,
			studentRepository: instance(studentRepo),
			courseRepository: instance(courseRepo),
			enrollmentRepository: instance(enrollmentRepo),
		})
	})

	it('should return failure when student is not found', async () => {
		when(studentRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			studentId: 'non-existent-student',
			courseId: 'course-id',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(StudentNotFoundError)
	})

	it('should return failure when course is not found', async () => {
		const student = await Student.create({
			idGenerator,
			input: { email: 'student@test.com', name: 'Test Student' },
		})

		when(studentRepo.findById(anything())).thenResolve(student)
		when(courseRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			studentId: student.id.toString(),
			courseId: 'non-existent-course',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(CourseNotFoundError)
	})

	it('should return failure when student is already enrolled', async () => {
		const student = await Student.create({
			idGenerator,
			input: { email: 'student@test.com', name: 'Test Student' },
		})
		const course = await Course.create({
			idGenerator,
			input: {
				title: 'Test Course',
				description: 'Course description',
				thumbnail: 'thumb.jpg',
				totalLessons: 10,
			},
		})
		const existingEnrollment = await Enrollment.create({
			idGenerator,
			input: {
				userId: student.id,
				courseId: course.id,
				totalLessons: course.totalLessons,
			},
		})

		when(studentRepo.findById(anything())).thenResolve(student)
		when(courseRepo.findById(anything())).thenResolve(course)
		when(
			enrollmentRepo.findStudentCourseEnrollment(anything(), anything())
		).thenResolve(existingEnrollment)

		const result = await sut.execute({
			studentId: student.id.toString(),
			courseId: course.id.toString(),
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(StudentAlreadyEnrolledError)
	})

	it('should return success with enrollment when student enrolls successfully', async () => {
		const student = await Student.create({
			idGenerator,
			input: { email: 'student@test.com', name: 'Test Student' },
		})
		const course = await Course.create({
			idGenerator,
			input: {
				title: 'Test Course',
				description: 'Course description',
				thumbnail: 'thumb.jpg',
				totalLessons: 10,
			},
		})

		when(studentRepo.findById(anything())).thenResolve(student)
		when(courseRepo.findById(anything())).thenResolve(course)
		when(
			enrollmentRepo.findStudentCourseEnrollment(anything(), anything())
		).thenResolve(null)
		when(enrollmentRepo.save(anything())).thenResolve()

		const result = await sut.execute({
			studentId: student.id.toString(),
			courseId: course.id.toString(),
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.enrollment.courseId.toString()).toBe(
				course.id.toString()
			)
			expect(result.value.enrollment.totalLessons).toBe(course.totalLessons)
		}
	})
})
