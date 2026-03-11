import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UniqueId } from '@repo/core'
import { GetAllModulesUseCase } from './get-all-modules-use-case'
import { ModuleRepository } from '../repositories/module-repository'
import { CourseRepository } from '../repositories/course-repository'
import { CourseNotFoundError } from '../@errors'
import { Module } from '../../domain/entities/module'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('GetAllModulesUseCase', () => {
	let moduleRepo: ModuleRepository
	let courseRepo: CourseRepository
	let sut: GetAllModulesUseCase

	beforeEach(() => {
		moduleRepo = mock(ModuleRepository)
		courseRepo = mock(CourseRepository)
		sut = new GetAllModulesUseCase({
			moduleRepository: instance(moduleRepo),
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

	it('should return success with modules list', async () => {
		const mockCourse: any = { id: { toString: () => 'course-id' } }
		when(courseRepo.findById(anything())).thenResolve(mockCourse)

		const module1 = await Module.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				title: 'Module 1',
				courseId: UniqueId('course-id'),
				order: 1,
			},
		})

		const module2 = await Module.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				title: 'Module 2',
				courseId: UniqueId('course-id'),
				order: 2,
			},
		})

		when(moduleRepo.findManyByCourseId(anything())).thenResolve([
			module1,
			module2,
		])

		const result = await sut.execute({
			courseId: 'course-id',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.modules).toHaveLength(2)
			expect(result.value.modules[0].title).toBe('Module 1')
			expect(result.value.modules[1].title).toBe('Module 2')
		}
	})
})
