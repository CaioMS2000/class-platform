import { IdGenerator, UniqueId } from '@repo/core'

export class FakeIdGenerator implements IdGenerator {
	async generate(): Promise<UniqueId> {
		return UniqueId('fake-id-' + Math.random().toString(36).substr(2, 9))
	}

	async generateBatch(size: number): Promise<UniqueId[]> {
		return Array.from({ length: size }, () =>
			UniqueId('fake-id-' + Math.random().toString(36).substr(2, 9))
		)
	}
}
