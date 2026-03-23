import { Money, UniqueId } from '@repo/core'
import type { CreateCourseInput } from '../../domain/entities/course'
import { Course } from '../../domain/entities/course'
import { FakeIdGenerator } from '../fake-id-generator'

const idGenerator = new FakeIdGenerator()

export async function makeCourse(overrides: Partial<CreateCourseInput> = {}) {
	const price = Money.create(9900, 'BRL')
	if (price.isFailure()) throw new Error('Invalid price')

	return Course.create({
		idGenerator,
		input: {
			instructorId: UniqueId(`instructor-${crypto.randomUUID()}`),
			title: `Course ${crypto.randomUUID().slice(0, 8)}`,
			description: 'A test course description',
			price: price.value,
			level: 'beginner',
			thumbnail: 'https://example.com/thumb.jpg',
			...overrides,
		},
	})
}
