import { Class, type IdGenerator, type UniqueId } from '@repo/core'

export type NoteProps = {
	id: UniqueId
	userId: UniqueId
	lessonId: UniqueId
	content: string
	timestamp?: number // momento do vídeo (opcional)
	isPrivate: boolean
	tags?: string[]

	createdAt: Date
	updatedAt: Date
}

type CreateNoteInput = Optional<
	Omit<NoteProps, 'id'>,
	'createdAt' | 'updatedAt'
>

type CreationParams = {
	idGenerator: IdGenerator
	input: CreateNoteInput
	id?: UniqueId
}

export type UpdateNoteInput = Partial<
	Omit<NoteProps, 'id' | 'courseId' | 'lessonId' | 'createdAt' | 'updatedAt'>
>

export class Note extends Class<NoteProps> {
	protected constructor(protected props: NoteProps) {
		super()
	}

	static async create({ idGenerator, input, id }: CreationParams) {
		const { createdAt = new Date(), updatedAt = new Date(), ...rest } = input

		if (!id) {
			id = await idGenerator.generate()
		}

		return new Note({
			id,
			createdAt,
			updatedAt,
			...rest,
		})
	}

	get id(): UniqueId {
		return this.props.id
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date {
		return this.props.updatedAt
	}

	update(input: UpdateNoteInput): Note {
		return new Note({
			...this.props,
			...(input.userId !== undefined && { userId: input.userId }),
			...(input.content !== undefined && { content: input.content }),
			...(input.timestamp !== undefined && { timestamp: input.timestamp }),
			...(input.isPrivate !== undefined && { isPrivate: input.isPrivate }),
			...(input.tags !== undefined && { tags: input.tags }),
			updatedAt: new Date(),
		})
	}
}
