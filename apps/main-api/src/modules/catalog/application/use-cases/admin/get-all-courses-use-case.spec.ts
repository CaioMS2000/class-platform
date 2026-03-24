import { instance, mock, when } from '@johanblumenberg/ts-mockito'
import { Money, UniqueId } from '@repo/core'
import { GetAllCoursesUseCase } from './get-all-courses-use-case'
import { CourseRepository } from '../../repositories/course-repository'
import { Course } from '../../../domain/entities/course'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('GetAllCoursesUseCase', () => {
	let courseRepo: CourseRepository
	let sut: GetAllCoursesUseCase

	beforeEach(() => {
		courseRepo = mock(CourseRepository)
		sut = new GetAllCoursesUseCase({
			courseRepository: instance(courseRepo),
		})
	})

	it('should return success with courses list', async () => {
		const course1 = await Course.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				instructorId: UniqueId('instructor-123'),
				title: 'Node.js Course',
				description: 'Learn Node.js',
				price: Money.create(10000, 'BRL').value as Money,
				level: 'beginner',
				thumbnail: 'thumb1.jpg',
			},
		})
		const course2 = await Course.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				instructorId: UniqueId('instructor-123'),
				title: 'React Course',
				description: 'Learn React',
				price: Money.create(12000, 'BRL').value as Money,
				level: 'intermediate',
				thumbnail: 'thumb2.jpg',
			},
		})

		when(courseRepo.findMany(undefined, undefined)).thenResolve([
			course1,
			course2,
		])

		const result = await sut.execute({})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.courses).toHaveLength(2)
			expect(result.value.courses[0]?.title).toBe('Node.js Course')
			expect(result.value.courses[1]?.title).toBe('React Course')
		}
	})
})
