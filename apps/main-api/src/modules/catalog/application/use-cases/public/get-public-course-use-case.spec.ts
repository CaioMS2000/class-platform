import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { Money, UniqueId } from '@repo/core'
import { GetPublicCourseUseCase } from './get-public-course-use-case'
import { CourseRepository } from '../../repositories/course-repository'
import { CourseNotFoundError } from '../../@errors'
import { Course } from '../../../domain/entities/course'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('GetPublicCourseUseCase', () => {
	let courseRepo: CourseRepository
	let sut: GetPublicCourseUseCase

	beforeEach(() => {
		courseRepo = mock(CourseRepository)
		sut = new GetPublicCourseUseCase({ courseRepository: instance(courseRepo) })
	})

	it('should return failure when course does not exist', async () => {
		when(courseRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({ courseId: 'non-existent' })

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(CourseNotFoundError)
	})

	it('should return failure when course is not published', async () => {
		const draft = await Course.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				instructorId: UniqueId('instructor-1'),
				title: 'Draft Course',
				description: 'Draft',
				price: Money.create(10000, 'BRL').value as Money,
				level: 'beginner',
				thumbnail: 'thumb.jpg',
				status: 'draft',
			},
		})

		when(courseRepo.findById(anything())).thenResolve(draft)

		const result = await sut.execute({ courseId: draft.id.toString() })

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(CourseNotFoundError)
	})

	it('should return published course', async () => {
		const published = await Course.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				instructorId: UniqueId('instructor-1'),
				title: 'Published Course',
				description: 'A published course',
				price: Money.create(10000, 'BRL').value as Money,
				level: 'beginner',
				thumbnail: 'thumb.jpg',
				status: 'published',
			},
		})

		when(courseRepo.findById(anything())).thenResolve(published)

		const result = await sut.execute({ courseId: published.id.toString() })

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.course.title).toBe('Published Course')
			expect(result.value.course.status).toBe('published')
		}
	})
})
