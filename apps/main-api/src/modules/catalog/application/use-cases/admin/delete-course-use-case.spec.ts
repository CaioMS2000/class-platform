import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { Money, UniqueId } from '@repo/core'
import { DeleteCourseUseCase } from './delete-course-use-case'
import { CourseRepository } from '../../repositories/course-repository'
import { CourseNotFoundError } from '../../@errors'
import { Course } from '../../../domain/entities/course'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('DeleteCourseUseCase', () => {
	let courseRepo: CourseRepository
	let sut: DeleteCourseUseCase

	beforeEach(() => {
		courseRepo = mock(CourseRepository)
		sut = new DeleteCourseUseCase({
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

	it('should return success and delete course', async () => {
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
		when(courseRepo.delete(anything())).thenResolve()

		const result = await sut.execute({
			courseId: course.id.toString(),
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value).toBeNull()
		}
	})
})
