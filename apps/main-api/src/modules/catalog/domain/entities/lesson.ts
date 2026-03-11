import { Class, type IdGenerator, type UniqueId } from '@repo/core'
import type { LessonContent, LessonType } from '../@types'

export type LessonProps = {
	id: UniqueId
	moduleId: UniqueId
	courseId: UniqueId
	order: number
	title: string
	description?: string

	// Conteúdo
	type: LessonType
	content: LessonContent

	// Duração
	duration: number // em minutos

	// Configurações
	isFree: boolean // aula liberada mesmo sem matrícula
	requiresPrevious: boolean // precisa completar anterior

	createdAt: Date
	updatedAt: Date
}

type CreateLessonInput = Optional<
	Omit<LessonProps, 'id'>,
	'createdAt' | 'updatedAt' | 'requiresPrevious'
>

type CreationParams = {
	idGenerator: IdGenerator
	input: CreateLessonInput
	id?: UniqueId
}

export type UpdateLessonInput = Partial<
	Omit<LessonProps, 'id' | 'courseId' | 'moduleId' | 'createdAt' | 'updatedAt'>
>

export class Lesson extends Class<LessonProps> {
	protected constructor(protected props: LessonProps) {
		super()
	}

	static async create({ idGenerator, input, id }: CreationParams) {
		const {
			createdAt = new Date(),
			updatedAt = new Date(),
			requiresPrevious = false,
			...rest
		} = input

		if (!id) {
			id = await idGenerator.generate()
		}

		return new Lesson({
			id,
			createdAt,
			updatedAt,
			requiresPrevious,
			...rest,
		})
	}

	get id(): UniqueId {
		return this.props.id
	}

	get title(): string {
		return this.props.title
	}

	get courseId(): UniqueId {
		return this.props.courseId
	}

	get moduleId(): UniqueId {
		return this.props.moduleId
	}

	get order(): number {
		return this.props.order
	}

	get description(): string | undefined {
		return this.props.description
	}

	get type(): LessonType {
		return this.props.type
	}

	get content(): LessonContent {
		return this.props.content
	}

	get duration(): number {
		return this.props.duration
	}

	get isFree(): boolean {
		return this.props.isFree
	}

	get requiresPrevious(): boolean {
		return this.props.requiresPrevious
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date {
		return this.props.updatedAt
	}

	update(input: UpdateLessonInput): Lesson {
		return new Lesson({
			...this.props,
			...(input.title !== undefined && { title: input.title }),
			...(input.description !== undefined && {
				description: input.description,
			}),
			...(input.order !== undefined && { order: input.order }),
			...(input.type !== undefined && { type: input.type }),
			...(input.content !== undefined && { content: input.content }),
			...(input.duration !== undefined && { duration: input.duration }),
			...(input.isFree !== undefined && { isFree: input.isFree }),
			...(input.requiresPrevious !== undefined && {
				requiresPrevious: input.requiresPrevious,
			}),
			updatedAt: new Date(),
		})
	}
}
