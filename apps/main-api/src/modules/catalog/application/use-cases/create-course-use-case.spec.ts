import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { Money, Result } from '@repo/core'
import { CreateCourseUseCase } from './create-course-use-case'
import { CourseRepository } from '../repositories/course-repository'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('CreateCourseUseCase', () => {
	let courseRepo: CourseRepository
	let sut: CreateCourseUseCase

	beforeEach(() => {
		courseRepo = mock(CourseRepository)
		sut = new CreateCourseUseCase({
			courseRepository: instance(courseRepo),
			idGenerator: new FakeIdGenerator(),
		})
	})

	it('should return success with created course', async () => {
		when(courseRepo.save(anything())).thenResolve()

		const result = await sut.execute({
			title: 'Node.js Course',
			description: 'Learn Node.js from scratch',
			price: Money.create(10000, 'BRL').value as Money,
			level: 'beginner',
			thumbnail: 'https://example.com/thumb.jpg',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { course } = result.value
			expect(course.title).toBe('Node.js Course')
			expect(course.description).toBe('Learn Node.js from scratch')
			expect(course.level).toBe('beginner')
			expect(course.thumbnail).toBe('https://example.com/thumb.jpg')
			expect(course.price.valueInCents).toBe(10000)
		}
	})
})
