import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { Money, UniqueId } from '@repo/core'
import { GetCourseUseCase } from './get-course-use-case'
import { CourseRepository } from '../repositories/course-repository'
import { CourseNotFoundError } from '../@errors'
import { Course } from '../../domain/entities/course'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('GetCourseUseCase', () => {
	let courseRepo: CourseRepository
	let sut: GetCourseUseCase

	beforeEach(() => {
		courseRepo = mock(CourseRepository)
		sut = new GetCourseUseCase({
			courseRepository: instance(courseRepo),
		})
	})

	it('should return failure when course is not found', async () => {
		when(courseRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			courseId: 'non-existent-id',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(CourseNotFoundError)
	})

	it('should return success with course', async () => {
		const course = await Course.create({
			idGenerator: new FakeIdGenerator(),
			input: {
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
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.course.id.toString()).toBe(course.id.toString())
		}
	})
})
