import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { Money, UniqueId } from '@repo/core'
import { BrowsePublicCatalogUseCase } from './browse-public-catalog-use-case'
import { CourseRepository } from '../../repositories/course-repository'
import { Course } from '../../../domain/entities/course'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('BrowsePublicCatalogUseCase', () => {
	let courseRepo: CourseRepository
	let sut: BrowsePublicCatalogUseCase

	beforeEach(() => {
		courseRepo = mock(CourseRepository)
		sut = new BrowsePublicCatalogUseCase({
			courseRepository: instance(courseRepo),
		})
	})

	it('should return only published courses', async () => {
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

		when(courseRepo.findMany(anything(), anything())).thenResolve([published])

		const result = await sut.execute({})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.courses).toHaveLength(1)
			expect(result.value.courses[0]?.status).toBe('published')
		}
	})

	it('should pass extra filters alongside status=published', async () => {
		when(courseRepo.findMany(anything(), anything())).thenResolve([])

		const result = await sut.execute({ filters: { level: 'beginner' } })

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.courses).toHaveLength(0)
		}
	})
})
