import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UniqueId } from '@repo/core'
import { GetModuleUseCase } from './get-module-use-case'
import { ModuleRepository } from '../repositories/module-repository'
import { ModuleNotFoundError } from '../@errors'
import { Module } from '../../domain/entities/module'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('GetModuleUseCase', () => {
	let moduleRepo: ModuleRepository
	let sut: GetModuleUseCase

	beforeEach(() => {
		moduleRepo = mock(ModuleRepository)
		sut = new GetModuleUseCase({
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

	it('should return success with module', async () => {
		const module = await Module.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				title: 'Intro to Node.js',
				courseId: UniqueId('course-id'),
				order: 1,
			},
		})

		when(moduleRepo.findById(anything())).thenResolve(module)

		const result = await sut.execute({
			moduleId: module.id.toString(),
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.module.id.toString()).toBe(module.id.toString())
		}
	})
})
