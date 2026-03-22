import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UniqueId } from '@repo/core'
import { MarkLessonCompleteUseCase } from './mark-lesson-complete-use-case'
import { EnrollmentRepository } from '../repositories/enrollment-repository'
import { ProgressRepository } from '../repositories/progress-repository'
import { EnrollmentNotFoundError } from '../@errors'
import { Enrollment } from '../../domain/models/enrollment'
import { Progress } from '../../domain/models/progress'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('MarkLessonCompleteUseCase', () => {
	let enrollmentRepo: EnrollmentRepository
	let progressRepo: ProgressRepository
	let idGenerator: FakeIdGenerator
	let sut: MarkLessonCompleteUseCase

	beforeEach(() => {
		enrollmentRepo = mock(EnrollmentRepository)
		progressRepo = mock(ProgressRepository)
		idGenerator = new FakeIdGenerator()
		sut = new MarkLessonCompleteUseCase({
			idGenerator,
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
			lessonId: 'lesson-id',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(EnrollmentNotFoundError)
	})

	it('should return early when lesson is already completed (idempotent)', async () => {
		const enrollment = await Enrollment.create({
			idGenerator,
			input: {
				userId: UniqueId('student-id'),
				courseId: UniqueId('course-id'),
				totalLessons: 5,
			},
		})
		const completedProgress = await Progress.create({
			idGenerator,
			input: {
				userId: UniqueId('student-id'),
				courseId: UniqueId('course-id'),
				lessonId: UniqueId('lesson-id'),
				status: 'completed',
				completedAt: new Date(),
				watchTime: 0,
				lastPosition: 0,
				timeSpent: 0,
			},
		})

		when(
			enrollmentRepo.findStudentCourseEnrollment(anything(), anything())
		).thenResolve(enrollment)
		when(progressRepo.findByUserAndLesson(anything(), anything())).thenResolve(
			completedProgress
		)

		const result = await sut.execute({
			studentId: 'student-id',
			courseId: 'course-id',
			lessonId: 'lesson-id',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.progress.status).toBe('completed')
		}
	})

	it('should update existing in-progress lesson to completed', async () => {
		const enrollment = await Enrollment.create({
			idGenerator,
			input: {
				userId: UniqueId('student-id'),
				courseId: UniqueId('course-id'),
				totalLessons: 5,
			},
		})
		const inProgressProgress = await Progress.create({
			idGenerator,
			input: {
				userId: UniqueId('student-id'),
				courseId: UniqueId('course-id'),
				lessonId: UniqueId('lesson-id'),
				status: 'in_progress',
				watchTime: 120,
				lastPosition: 120,
				timeSpent: 120,
			},
		})

		when(
			enrollmentRepo.findStudentCourseEnrollment(anything(), anything())
		).thenResolve(enrollment)
		when(progressRepo.findByUserAndLesson(anything(), anything())).thenResolve(
			inProgressProgress
		)
		when(progressRepo.update(anything())).thenResolve()
		when(enrollmentRepo.update(anything())).thenResolve()

		const result = await sut.execute({
			studentId: 'student-id',
			courseId: 'course-id',
			lessonId: 'lesson-id',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.progress.status).toBe('completed')
			expect(result.value.enrollment.completedLessons).toBe(1)
		}
	})

	it('should create new progress when none exists', async () => {
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
		when(progressRepo.findByUserAndLesson(anything(), anything())).thenResolve(
			null
		)
		when(progressRepo.save(anything())).thenResolve()
		when(enrollmentRepo.update(anything())).thenResolve()

		const result = await sut.execute({
			studentId: 'student-id',
			courseId: 'course-id',
			lessonId: 'lesson-id',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.progress.status).toBe('completed')
			expect(result.value.enrollment.completedLessons).toBe(1)
		}
	})

	it('should mark enrollment as completed when last lesson is finished', async () => {
		const enrollment = await Enrollment.create({
			idGenerator,
			input: {
				userId: UniqueId('student-id'),
				courseId: UniqueId('course-id'),
				totalLessons: 1,
			},
		})

		when(
			enrollmentRepo.findStudentCourseEnrollment(anything(), anything())
		).thenResolve(enrollment)
		when(progressRepo.findByUserAndLesson(anything(), anything())).thenResolve(
			null
		)
		when(progressRepo.save(anything())).thenResolve()
		when(enrollmentRepo.update(anything())).thenResolve()

		const result = await sut.execute({
			studentId: 'student-id',
			courseId: 'course-id',
			lessonId: 'lesson-id',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.enrollment.status).toBe('completed')
			expect(result.value.enrollment.completedLessons).toBe(1)
		}
	})
})
