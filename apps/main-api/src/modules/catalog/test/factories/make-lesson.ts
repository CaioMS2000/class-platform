import { UniqueId } from '@repo/core'
import type { LessonProps } from '../../domain/entities/lesson'
import { Lesson } from '../../domain/entities/lesson'
import { FakeIdGenerator } from '../fake-id-generator'

const idGenerator = new FakeIdGenerator()

export async function makeLesson(
	overrides: Partial<Omit<LessonProps, 'id'>> = {}
) {
	return Lesson.create({
		idGenerator,
		input: {
			moduleId: UniqueId(`module-${crypto.randomUUID()}`),
			courseId: UniqueId(`course-${crypto.randomUUID()}`),
			order: 1,
			title: `Lesson ${crypto.randomUUID().slice(0, 8)}`,
			type: 'video',
			content: { videoUrl: 'https://example.com/video.mp4' },
			duration: 10,
			isFree: false,
			...overrides,
		},
	})
}
