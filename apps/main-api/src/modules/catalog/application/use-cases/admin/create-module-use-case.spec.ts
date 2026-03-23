import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { Result } from '@repo/core'
import { CreateModuleUseCase } from './create-module-use-case'
import { ModuleRepository } from '../../repositories/module-repository'
import { CourseRepository } from '../../repositories/course-repository'
import { CourseNotFoundError } from '../../@errors'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('CreateModuleUseCase', () => {
	let moduleRepo: ModuleRepository
	let courseRepo: CourseRepository
	let sut: CreateModuleUseCase

	beforeEach(() => {
		moduleRepo = mock(ModuleRepository)
		courseRepo = mock(CourseRepository)
		sut = new CreateModuleUseCase({
			moduleRepository: instance(moduleRepo),
			courseRepository: instance(courseRepo),
			idGenerator: new FakeIdGenerator(),
		})
	})

	it('should return failure when course is not found', async () => {
		when(courseRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			courseId: 'non-existent-id',
			title: 'Intro to Node',
			order: 1,
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(CourseNotFoundError)
	})

	it('should return success with created module', async () => {
		const mockCourse: any = { id: { toString: () => 'course-id' } }
		when(courseRepo.findById(anything())).thenResolve(mockCourse)
		when(moduleRepo.save(anything())).thenResolve()

		const result = await sut.execute({
			courseId: 'course-id',
			title: 'Intro to Node.js',
			description: 'The very basics',
			order: 1,
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { module } = result.value
			expect(module.title).toBe('Intro to Node.js')
			expect(module.courseId.toString()).toBe('course-id')
			expect(module.order).toBe(1)
		}
	})
})
