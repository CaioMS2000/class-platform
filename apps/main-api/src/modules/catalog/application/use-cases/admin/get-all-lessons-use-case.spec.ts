import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { UniqueId } from '@repo/core'
import { GetAllLessonsUseCase } from './get-all-lessons-use-case'
import { LessonRepository } from '../../repositories/lesson-repository'
import { ModuleRepository } from '../../repositories/module-repository'
import { ModuleNotFoundError } from '../../@errors'
import { Lesson } from '../../../domain/entities/lesson'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('GetAllLessonsUseCase', () => {
	let lessonRepo: LessonRepository
	let moduleRepo: ModuleRepository
	let sut: GetAllLessonsUseCase

	beforeEach(() => {
		lessonRepo = mock(LessonRepository)
		moduleRepo = mock(ModuleRepository)
		sut = new GetAllLessonsUseCase({
			lessonRepository: instance(lessonRepo),
			moduleRepository: instance(moduleRepo),
		})
	})

	it('should return failure when module is not found', async () => {
		when(moduleRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			moduleId: 'non-existent-id',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(ModuleNotFoundError)
	})

	it('should return success with lessons list', async () => {
		const mockModule: any = { id: { toString: () => 'module-id' } }
		when(moduleRepo.findById(anything())).thenResolve(mockModule)

		const lesson1 = await Lesson.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				title: 'Lesson 1',
				courseId: UniqueId('course-id'),
				moduleId: UniqueId('module-id'),
				order: 1,
				type: 'video',
				content: { videoUrl: 'url' },
				duration: 10,
				isFree: true,
			},
		})

		const lesson2 = await Lesson.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				title: 'Lesson 2',
				courseId: UniqueId('course-id'),
				moduleId: UniqueId('module-id'),
				order: 2,
				type: 'article',
				content: { article: 'text' },
				duration: 5,
				isFree: false,
			},
		})

		when(lessonRepo.findManyByModuleId(anything())).thenResolve([
			lesson1,
			lesson2,
		])

		const result = await sut.execute({
			moduleId: 'module-id',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.lessons).toHaveLength(2)
			expect(result.value.lessons[0].title).toBe('Lesson 1')
			expect(result.value.lessons[1].title).toBe('Lesson 2')
		}
	})
})
