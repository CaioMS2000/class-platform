import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UniqueId } from '@repo/core'
import { DeleteModuleUseCase } from './delete-module-use-case'
import { ModuleRepository } from '../repositories/module-repository'
import { ModuleNotFoundError } from '../@errors'
import { Module } from '../../domain/entities/module'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('DeleteModuleUseCase', () => {
	let moduleRepo: ModuleRepository
	let sut: DeleteModuleUseCase

	beforeEach(() => {
		moduleRepo = mock(ModuleRepository)
		sut = new DeleteModuleUseCase({
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

	it('should return success and delete module', async () => {
		const module = await Module.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				title: 'Intro',
				courseId: UniqueId('course-id'),
				order: 1,
			},
		})

		when(moduleRepo.findById(anything())).thenResolve(module)
		when(moduleRepo.delete(anything())).thenResolve()

		const result = await sut.execute({
			moduleId: module.id.toString(),
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value).toBeNull()
		}
	})
})
