import { Class, type IdGenerator, type UniqueId } from '@repo/core'
import type { ProgressStatus } from './@types'

export type ProgressProps = {
	id: UniqueId
	userId: UniqueId
	courseId: UniqueId
	lessonId: UniqueId
	status: ProgressStatus

	// Watch progress (para vídeos)
	watchTime: number // segundos assistidos
	lastPosition: number // último segundo
	completedAt?: Date

	// Interações
	notesIds?: string[]

	// Métricas
	timeSpent: number // total em segundos
	deviceType?: string

	createdAt: Date
	updatedAt: Date
}

type CreateProgressInput = Optional<
	Omit<ProgressProps, 'id'>,
	'createdAt' | 'updatedAt' | 'status'
>

type CreationParams = {
	idGenerator: IdGenerator
	input: CreateProgressInput
	id?: UniqueId
}

export type UpdateProgressInput = Partial<
	Omit<
		ProgressProps,
		'id' | 'courseId' | 'lessonId' | 'createdAt' | 'updatedAt'
	>
>

export class Progress extends Class<ProgressProps> {
	protected constructor(protected props: ProgressProps) {
		super()
	}

	static async create({ idGenerator, input, id }: CreationParams) {
		const {
			createdAt = new Date(),
			updatedAt = new Date(),
			status = 'in_progress',
			...rest
		} = input

		if (!id) {
			id = await idGenerator.generate()
		}

		return new Progress({
			id,
			createdAt,
			updatedAt,
			status,
			...rest,
		})
	}

	get id(): UniqueId {
		return this.props.id
	}

	get courseId(): UniqueId {
		return this.props.courseId
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date {
		return this.props.updatedAt
	}

	get status(): ProgressStatus {
		return this.props.status
	}

	update(input: UpdateProgressInput): Progress {
		return new Progress({
			...this.props,
			...(input.userId !== undefined && { userId: input.userId }),
			...(input.status !== undefined && { status: input.status }),
			...(input.watchTime !== undefined && { watchTime: input.watchTime }),
			...(input.lastPosition !== undefined && {
				lastPosition: input.lastPosition,
			}),
			...(input.completedAt !== undefined && {
				completedAt: input.completedAt,
			}),
			...(input.notesIds !== undefined && { notesIds: input.notesIds }),
			...(input.timeSpent !== undefined && { timeSpent: input.timeSpent }),
			...(input.deviceType !== undefined && { deviceType: input.deviceType }),
			updatedAt: new Date(),
		})
	}
}
