import { IdGenerator, type UniqueId } from '@repo/core'

/**
 * Stub used exclusively for reconstructing domain entities from persistence rows.
 * The `generate` method is never called when an `id` is already provided to the
 * entity's static `create()` factory — TypeScript still requires an IdGenerator
 * to be passed, so this satisfies the type constraint without side effects.
 */
export class NullIdGenerator extends IdGenerator {
	generate(): Promise<UniqueId> {
		throw new Error('NullIdGenerator.generate should never be called')
	}

	generateBatch(): Promise<UniqueId[]> {
		throw new Error('NullIdGenerator.generateBatch should never be called')
	}
}

export const nullIdGenerator = new NullIdGenerator()
