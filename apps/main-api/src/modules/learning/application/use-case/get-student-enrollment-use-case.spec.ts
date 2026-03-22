import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UniqueId } from '@repo/core'
import { GetStudentEnrollmentUseCase } from './get-student-enrollment-use-case'
import { StudentRepository } from '../repositories/student-repository'
import { CourseRepository } from '../repositories/course-repository'
import { EnrollmentRepository } from '../repositories/enrollment-repository'
import { StudentNotFoundError, CourseNotFoundError } from '../@errors'
import { Student } from '../../domain/models/student'
import { Course } from '../../domain/models/course'
import { Enrollment } from '../../domain/models/enrollment'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('GetStudentEnrollmentUseCase', () => {
	let studentRepo: StudentRepository
	let courseRepo: CourseRepository
	let enrollmentRepo: EnrollmentRepository
	let idGenerator: FakeIdGenerator
	let sut: GetStudentEnrollmentUseCase

	beforeEach(() => {
		studentRepo = mock(StudentRepository)
		courseRepo = mock(CourseRepository)
		enrollmentRepo = mock(EnrollmentRepository)
		idGenerator = new FakeIdGenerator()
		sut = new GetStudentEnrollmentUseCase({
			studentRepository: instance(studentRepo),
			courseRepository: instance(courseRepo),
			enrollmentRepository: instance(enrollmentRepo),
		})
	})

	it('should return failure when student is not found', async () => {
		when(studentRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			studentId: 'non-existent',
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

	it('should return success with null when student is not enrolled', async () => {
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
				totalLessons: 5,
			},
		})

		when(studentRepo.findById(anything())).thenResolve(student)
		when(courseRepo.findById(anything())).thenResolve(course)
		when(
			enrollmentRepo.findStudentCourseEnrollment(anything(), anything())
		).thenResolve(null)

		const result = await sut.execute({
			studentId: student.id.toString(),
			courseId: course.id.toString(),
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.enrollment).toBeNull()
		}
	})

	it('should return success with enrollment when student is enrolled', async () => {
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
				totalLessons: 5,
			},
		})
		const enrollment = await Enrollment.create({
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
		).thenResolve(enrollment)

		const result = await sut.execute({
			studentId: student.id.toString(),
			courseId: course.id.toString(),
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.enrollment?.courseId.toString()).toBe(
				course.id.toString()
			)
		}
	})
})
