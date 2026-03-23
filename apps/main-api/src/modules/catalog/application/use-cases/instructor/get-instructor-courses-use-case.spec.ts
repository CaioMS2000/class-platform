import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { Money, UniqueId } from '@repo/core'
import { GetInstructorCoursesUseCase } from './get-instructor-courses-use-case'
import { CourseRepository } from '../../repositories/course-repository'
import { Course } from '../../../domain/entities/course'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('GetInstructorCoursesUseCase', () => {
	let courseRepo: CourseRepository
	let sut: GetInstructorCoursesUseCase

	beforeEach(() => {
		courseRepo = mock(CourseRepository)
		sut = new GetInstructorCoursesUseCase({
			courseRepository: instance(courseRepo),
		})
	})

	it('should return courses belonging to the instructor', async () => {
		const instructorId = 'instructor-abc'

		const course = await Course.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				instructorId: UniqueId(instructorId),
				title: 'My Course',
				description: 'Course by this instructor',
				price: Money.create(10000, 'BRL').value as Money,
				level: 'beginner',
				thumbnail: 'thumb.jpg',
			},
		})

		when(courseRepo.findMany(anything(), anything())).thenResolve([course])

		const result = await sut.execute({ instructorId })

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.courses).toHaveLength(1)
			expect(result.value.courses[0]?.instructorId.toString()).toBe(
				instructorId
			)
		}
	})

	it('should return empty list when instructor has no courses', async () => {
		when(courseRepo.findMany(anything(), undefined)).thenResolve([])

		const result = await sut.execute({ instructorId: 'no-courses-instructor' })

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.courses).toHaveLength(0)
		}
	})
})
