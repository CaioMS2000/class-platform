import { UniqueId } from '@repo/core'
import type { ModuleProps } from '../../domain/entities/module'
import { Module } from '../../domain/entities/module'
import { FakeIdGenerator } from '../fake-id-generator'

const idGenerator = new FakeIdGenerator()

export async function makeModule(
	overrides: Partial<Omit<ModuleProps, 'id'>> = {}
) {
	return Module.create({
		idGenerator,
		input: {
			courseId: UniqueId(`course-${crypto.randomUUID()}`),
			order: 1,
			title: `Module ${crypto.randomUUID().slice(0, 8)}`,
			...overrides,
		},
	})
}
