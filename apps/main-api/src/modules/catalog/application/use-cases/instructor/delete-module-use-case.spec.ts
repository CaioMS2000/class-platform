import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UniqueId } from '@repo/core'
import { InstructorDeleteModuleUseCase } from './delete-module-use-case'
import { ModuleRepository } from '../../repositories/module-repository'
import { CourseRepository } from '../../repositories/course-repository'
import { ModuleNotFoundError, NotCourseOwnerError } from '../../@errors'
import { Module } from '../../../domain/entities/module'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('InstructorDeleteModuleUseCase', () => {
	let moduleRepo: ModuleRepository
	let courseRepo: CourseRepository
	let sut: InstructorDeleteModuleUseCase

	beforeEach(() => {
		moduleRepo = mock(ModuleRepository)
		courseRepo = mock(CourseRepository)
		sut = new InstructorDeleteModuleUseCase({
			moduleRepository: instance(moduleRepo),
			courseRepository: instance(courseRepo),
		})
	})

	it('should return failure when module is not found', async () => {
		when(moduleRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			moduleId: 'non-existent-id',
			instructorId: 'instructor-123',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(ModuleNotFoundError)
	})

	it('should return failure when instructor is not the course owner', async () => {
		const module = await Module.create({
			idGenerator: new FakeIdGenerator(),
			input: { courseId: UniqueId('course-id'), title: 'Module 1', order: 1 },
		})
		const mockCourse: any = { instructorId: UniqueId('other-instructor') }

		when(moduleRepo.findById(anything())).thenResolve(module)
		when(courseRepo.findById(anything())).thenResolve(mockCourse)

		const result = await sut.execute({
			moduleId: module.id.toString(),
			instructorId: 'instructor-123',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(NotCourseOwnerError)
	})

	it('should return success and delete module', async () => {
		const module = await Module.create({
			idGenerator: new FakeIdGenerator(),
			input: { courseId: UniqueId('course-id'), title: 'Module 1', order: 1 },
		})
		const mockCourse: any = { instructorId: UniqueId('instructor-123') }

		when(moduleRepo.findById(anything())).thenResolve(module)
		when(courseRepo.findById(anything())).thenResolve(mockCourse)
		when(moduleRepo.delete(anything())).thenResolve()

		const result = await sut.execute({
			moduleId: module.id.toString(),
			instructorId: 'instructor-123',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value).toBeNull()
		}
	})
})
