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
}
