import { createSlug } from '@/utils/slug'
import { Class, type IdGenerator, type UniqueId } from '@repo/core'

export type LessonProps = {
	id: UniqueId
	name: string
	slug: string
	description?: string
	parentId?: UniqueId
	icon?: string
}

type CreateLessonInput = Optional<Omit<LessonProps, 'id'>, 'slug'>

type CreationParams = {
	idGenerator: IdGenerator
	input: CreateLessonInput
	id?: UniqueId
}

export class Lesson extends Class<LessonProps> {
	protected constructor(protected props: LessonProps) {
		super()
	}

	static async create({ idGenerator, input, id }: CreationParams) {
		const { slug = createSlug(input.name), ...rest } = input

		if (!id) {
			id = await idGenerator.generate()
		}

		return new Lesson({
			id,
			slug,
			...rest,
		})
	}
}
