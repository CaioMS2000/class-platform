import type { CategoryProps } from '../../domain/entities/category'
import { Category } from '../../domain/entities/category'
import { FakeIdGenerator } from '../fake-id-generator'

const idGenerator = new FakeIdGenerator()

export async function makeCategory(
	overrides: Partial<Omit<CategoryProps, 'id'>> = {}
) {
	return Category.create({
		idGenerator,
		input: {
			name: `Category ${crypto.randomUUID().slice(0, 8)}`,
			...overrides,
		},
	})
}
