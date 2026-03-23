import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { UniqueId } from '@repo/core'
import { InstructorGetAllModulesUseCase } from './get-all-modules-use-case'
import { ModuleRepository } from '../../repositories/module-repository'
import { CourseRepository } from '../../repositories/course-repository'
import { CourseNotFoundError, NotCourseOwnerError } from '../../@errors'
import { Module } from '../../../domain/entities/module'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('InstructorGetAllModulesUseCase', () => {
	let moduleRepo: ModuleRepository
	let courseRepo: CourseRepository
	let sut: InstructorGetAllModulesUseCase

	beforeEach(() => {
		moduleRepo = mock(ModuleRepository)
		courseRepo = mock(CourseRepository)
		sut = new InstructorGetAllModulesUseCase({
			moduleRepository: instance(moduleRepo),
			courseRepository: instance(courseRepo),
		})
	})

	it('should return failure when course is not found', async () => {
		when(courseRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			courseId: 'non-existent-id',
			instructorId: 'instructor-123',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(CourseNotFoundError)
	})

	it('should return failure when instructor is not the course owner', async () => {
		const mockCourse: any = { instructorId: UniqueId('other-instructor') }
		when(courseRepo.findById(anything())).thenResolve(mockCourse)

		const result = await sut.execute({
			courseId: 'course-id',
			instructorId: 'instructor-123',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(NotCourseOwnerError)
	})

	it('should return success with modules', async () => {
		const mockCourse: any = { instructorId: UniqueId('instructor-123') }
		const module1 = await Module.create({
			idGenerator: new FakeIdGenerator(),
			input: { courseId: UniqueId('course-id'), title: 'Module 1', order: 1 },
		})
		const module2 = await Module.create({
			idGenerator: new FakeIdGenerator(),
			input: { courseId: UniqueId('course-id'), title: 'Module 2', order: 2 },
		})

		when(courseRepo.findById(anything())).thenResolve(mockCourse)
		when(moduleRepo.findManyByCourseId(anything())).thenResolve([
			module1,
			module2,
		])

		const result = await sut.execute({
			courseId: 'course-id',
			instructorId: 'instructor-123',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.modules).toHaveLength(2)
		}
	})
})
