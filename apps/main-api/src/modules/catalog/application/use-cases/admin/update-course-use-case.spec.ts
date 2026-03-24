import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { Money, UniqueId } from '@repo/core'
import { UpdateCourseUseCase } from './update-course-use-case'
import { CourseRepository } from '../../repositories/course-repository'
import { CategoryRepository } from '../../repositories/category-repository'
import { CourseNotFoundError } from '../../@errors'
import { Course } from '../../../domain/entities/course'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('UpdateCourseUseCase', () => {
	let courseRepo: CourseRepository
	let sut: UpdateCourseUseCase

	beforeEach(() => {
		courseRepo = mock(CourseRepository)
		sut = new UpdateCourseUseCase({
			courseRepository: instance(courseRepo),
			categoryRepository: instance(mock(CategoryRepository)),
		})
	})

	it('should return failure when course is not found', async () => {
		when(courseRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			courseId: 'non-existent-id',
			title: 'New Title',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(CourseNotFoundError)
	})

	it('should return success with updated course', async () => {
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
		when(courseRepo.update(anything())).thenResolve()

		const result = await sut.execute({
			courseId: course.id.toString(),
			title: 'Advanced Node.js',
			level: 'advanced',
			price: Money.create(15000, 'BRL').value as Money,
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.course.title).toBe('Advanced Node.js')
			expect(result.value.course.level).toBe('advanced')
			expect(result.value.course.price.valueInCents).toBe(15000)
			expect(result.value.course.description).toBe('Learn Node.js') // unchanged
		}
	})
})
