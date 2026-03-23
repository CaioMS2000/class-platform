import { UniqueId } from '@repo/core'
import type { ProgressProps } from '../../domain/models/progress'
import { Progress } from '../../domain/models/progress'
import { FakeIdGenerator } from '../fake-id-generator'

const idGenerator = new FakeIdGenerator()

export async function makeProgress(
	overrides: Partial<Omit<ProgressProps, 'id'>> = {}
) {
	return Progress.create({
		idGenerator,
		input: {
			userId: UniqueId(`user-${crypto.randomUUID()}`),
			courseId: UniqueId(`course-${crypto.randomUUID()}`),
			lessonId: UniqueId(`lesson-${crypto.randomUUID()}`),
			watchTime: 0,
			lastPosition: 0,
			timeSpent: 0,
			...overrides,
		},
	})
}
