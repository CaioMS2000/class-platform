import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { Money } from '@repo/core'
import { InstructorCreateCourseUseCase } from './create-course-use-case'
import { CourseRepository } from '../../repositories/course-repository'
import { CategoryRepository } from '../../repositories/category-repository'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('InstructorCreateCourseUseCase', () => {
	let courseRepo: CourseRepository
	let sut: InstructorCreateCourseUseCase

	beforeEach(() => {
		courseRepo = mock(CourseRepository)
		sut = new InstructorCreateCourseUseCase({
			courseRepository: instance(courseRepo),
			categoryRepository: instance(mock(CategoryRepository)),
			idGenerator: new FakeIdGenerator(),
		})
	})

	it('should return success with created course', async () => {
		when(courseRepo.save(anything())).thenResolve()

		const result = await sut.execute({
			instructorId: 'instructor-123',
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
			expect(course.instructorId.toString()).toBe('instructor-123')
			expect(course.level).toBe('beginner')
		}
	})
})
