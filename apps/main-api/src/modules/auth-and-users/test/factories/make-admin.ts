import type { AdminProps } from '../../domain/models/admin'
import { Admin } from '../../domain/models/admin'
import { FakeIdGenerator } from '../fake-id-generator'

const idGenerator = new FakeIdGenerator()

export async function makeAdmin(
	overrides: Partial<Omit<AdminProps, 'id'>> = {}
) {
	return Admin.create({
		idGenerator,
		input: {
			email: `admin-${crypto.randomUUID()}@test.com`,
			passwordHash: 'hashed-password',
			name: 'Test Admin',
			...overrides,
		},
	})
}
