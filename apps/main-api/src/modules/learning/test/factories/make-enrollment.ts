import { UniqueId } from '@repo/core'
import type { EnrollmentProps } from '../../domain/models/enrollment'
import { Enrollment } from '../../domain/models/enrollment'
import { FakeIdGenerator } from '../fake-id-generator'

const idGenerator = new FakeIdGenerator()

export async function makeEnrollment(
	overrides: Partial<Omit<EnrollmentProps, 'id'>> = {}
) {
	return Enrollment.create({
		idGenerator,
		input: {
			userId: UniqueId(`user-${crypto.randomUUID()}`),
			courseId: UniqueId(`course-${crypto.randomUUID()}`),
			totalLessons: 10,
			...overrides,
		},
	})
}
