import type { IdGenerator, UniqueId } from '@repo/core'

export async function resolveId(
	idGenerator: IdGenerator,
	id?: UniqueId
): Promise<UniqueId> {
	if (!id) {
		id = await idGenerator.generate()
	}

	return id
}
