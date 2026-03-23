import type { StudentProps } from '../../domain/models/student'
import { Student } from '../../domain/models/student'
import { FakeIdGenerator } from '../fake-id-generator'

const idGenerator = new FakeIdGenerator()

export async function makeStudent(
	overrides: Partial<Omit<StudentProps, 'id'>> = {}
) {
	return Student.create({
		idGenerator,
		input: {
			email: `student-${crypto.randomUUID()}@test.com`,
			passwordHash: 'hashed-password',
			name: 'Test Student',
			...overrides,
		},
	})
}
