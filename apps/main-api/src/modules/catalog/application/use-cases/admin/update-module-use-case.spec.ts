import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UniqueId } from '@repo/core'
import { UpdateModuleUseCase } from './update-module-use-case'
import { ModuleRepository } from '../../repositories/module-repository'
import { ModuleNotFoundError } from '../../@errors'
import { Module } from '../../../domain/entities/module'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('UpdateModuleUseCase', () => {
	let moduleRepo: ModuleRepository
	let sut: UpdateModuleUseCase

	beforeEach(() => {
		moduleRepo = mock(ModuleRepository)
		sut = new UpdateModuleUseCase({
			moduleRepository: instance(moduleRepo),
		})
	})

	it('should return failure when module is not found', async () => {
		when(moduleRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			moduleId: 'non-existent-id',
			title: 'New Title',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(ModuleNotFoundError)
	})

	it('should return success with updated module', async () => {
		const module = await Module.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				title: 'Module 1',
				courseId: UniqueId('course-id'),
				order: 1,
			},
		})

		when(moduleRepo.findById(anything())).thenResolve(module)
		when(moduleRepo.update(anything())).thenResolve()

		const result = await sut.execute({
			moduleId: module.id.toString(),
			title: 'Advanced Module',
			order: 2,
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.module.title).toBe('Advanced Module')
			expect(result.value.module.order).toBe(2)
		}
	})
})
