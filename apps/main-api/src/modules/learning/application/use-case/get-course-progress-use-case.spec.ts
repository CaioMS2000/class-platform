import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { UniqueId } from '@repo/core'
import { GetCourseProgressUseCase } from './get-course-progress-use-case'
import { EnrollmentRepository } from '../repositories/enrollment-repository'
import { ProgressRepository } from '../repositories/progress-repository'
import { EnrollmentNotFoundError } from '../@errors'
import { Enrollment } from '../../domain/models/enrollment'
import { Progress } from '../../domain/models/progress'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('GetCourseProgressUseCase', () => {
	let enrollmentRepo: EnrollmentRepository
	let progressRepo: ProgressRepository
	let idGenerator: FakeIdGenerator
	let sut: GetCourseProgressUseCase

	beforeEach(() => {
		enrollmentRepo = mock(EnrollmentRepository)
		progressRepo = mock(ProgressRepository)
		idGenerator = new FakeIdGenerator()
		sut = new GetCourseProgressUseCase({
			enrollmentRepository: instance(enrollmentRepo),
			progressRepository: instance(progressRepo),
		})
	})

	it('should return failure when enrollment is not found', async () => {
		when(
			enrollmentRepo.findStudentCourseEnrollment(anything(), anything())
		).thenResolve(null)

		const result = await sut.execute({
			studentId: 'student-id',
			courseId: 'course-id',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(EnrollmentNotFoundError)
	})

	it('should return success with empty progress records', async () => {
		const enrollment = await Enrollment.create({
			idGenerator,
			input: {
				userId: UniqueId('student-id'),
				courseId: UniqueId('course-id'),
				totalLessons: 5,
			},
		})

		when(
			enrollmentRepo.findStudentCourseEnrollment(anything(), anything())
		).thenResolve(enrollment)
		when(
			progressRepo.findManyByUserAndCourse(anything(), anything())
		).thenResolve([])

		const result = await sut.execute({
			studentId: 'student-id',
			courseId: 'course-id',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.progressRecords).toHaveLength(0)
			expect(result.value.enrollment.courseId.toString()).toBe('course-id')
		}
	})

	it('should return success with all progress records', async () => {
		const enrollment = await Enrollment.create({
			idGenerator,
			input: {
				userId: UniqueId('student-id'),
				courseId: UniqueId('course-id'),
				totalLessons: 5,
			},
		})
		const progress1 = await Progress.create({
			idGenerator,
			input: {
				userId: UniqueId('student-id'),
				courseId: UniqueId('course-id'),
				lessonId: UniqueId('lesson-1'),
				status: 'completed',
				completedAt: new Date(),
				watchTime: 300,
				lastPosition: 300,
				timeSpent: 300,
			},
		})
		const progress2 = await Progress.create({
			idGenerator,
			input: {
				userId: UniqueId('student-id'),
				courseId: UniqueId('course-id'),
				lessonId: UniqueId('lesson-2'),
				status: 'in_progress',
				watchTime: 120,
				lastPosition: 120,
				timeSpent: 120,
			},
		})

		when(
			enrollmentRepo.findStudentCourseEnrollment(anything(), anything())
		).thenResolve(enrollment)
		when(
			progressRepo.findManyByUserAndCourse(anything(), anything())
		).thenResolve([progress1, progress2])

		const result = await sut.execute({
			studentId: 'student-id',
			courseId: 'course-id',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.progressRecords).toHaveLength(2)
			expect(result.value.progressRecords[0].status).toBe('completed')
			expect(result.value.progressRecords[1].status).toBe('in_progress')
		}
	})
})
