import type { InstructorProps } from '../../domain/models/instructor'
import { Instructor } from '../../domain/models/instructor'
import { FakeIdGenerator } from '../fake-id-generator'

const idGenerator = new FakeIdGenerator()

export async function makeInstructor(
	overrides: Partial<Omit<InstructorProps, 'id'>> = {}
) {
	return Instructor.create({
		idGenerator,
		input: {
			email: `instructor-${crypto.randomUUID()}@test.com`,
			passwordHash: 'hashed-password',
			name: 'Test Instructor',
			...overrides,
		},
	})
}
