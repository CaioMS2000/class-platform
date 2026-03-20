import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { Money, UniqueId } from '@repo/core'
import { InstructorGetCourseUseCase } from './get-course-use-case'
import { CourseRepository } from '../../repositories/course-repository'
import { CourseNotFoundError, NotCourseOwnerError } from '../../@errors'
import { Course } from '../../../domain/entities/course'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('InstructorGetCourseUseCase', () => {
	let courseRepo: CourseRepository
	let sut: InstructorGetCourseUseCase

	beforeEach(() => {
		courseRepo = mock(CourseRepository)
		sut = new InstructorGetCourseUseCase({
			courseRepository: instance(courseRepo),
		})
	})

	it('should return failure when course is not found', async () => {
		when(courseRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			courseId: 'non-existent-id',
			instructorId: 'instructor-123',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(CourseNotFoundError)
	})

	it('should return failure when instructor is not the course owner', async () => {
		const course = await Course.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				instructorId: UniqueId('other-instructor'),
				title: 'Node.js Course',
				description: 'Learn Node.js',
				price: Money.create(10000, 'BRL').value as Money,
				level: 'beginner',
				thumbnail: 'thumb.jpg',
			},
		})

		when(courseRepo.findById(anything())).thenResolve(course)

		const result = await sut.execute({
			courseId: course.id.toString(),
			instructorId: 'instructor-123',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(NotCourseOwnerError)
	})

	it('should return success with course when instructor is the owner', async () => {
		const course = await Course.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				instructorId: UniqueId('instructor-123'),
				title: 'Node.js Course',
				description: 'Learn Node.js',
				price: Money.create(10000, 'BRL').value as Money,
				level: 'beginner',
				thumbnail: 'thumb.jpg',
			},
		})

		when(courseRepo.findById(anything())).thenResolve(course)

		const result = await sut.execute({
			courseId: course.id.toString(),
			instructorId: 'instructor-123',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.course.id.toString()).toBe(course.id.toString())
			expect(result.value.course.instructorId.toString()).toBe('instructor-123')
		}
	})
})
