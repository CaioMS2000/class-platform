import { Class, type IdGenerator, type UniqueId } from '@repo/core'

export type WatchHistoryProps = {
	id: UniqueId
	userId: UniqueId
	lessonId: UniqueId
	courseId: UniqueId
	watchedAt: Date
	watchDuration: number // segundos assistidos
	completed: boolean
	deviceInfo?: {
		type: 'mobile' | 'desktop' | 'tablet'
		os: string
	}

	createdAt: Date
	updatedAt: Date
}

type CreateWatchHistoryInput = Optional<
	Omit<WatchHistoryProps, 'id'>,
	'createdAt' | 'updatedAt'
>

type CreationParams = {
	idGenerator: IdGenerator
	input: CreateWatchHistoryInput
	id?: UniqueId
}

export type UpdateWatchHistoryInput = Partial<
	Omit<
		WatchHistoryProps,
		'id' | 'courseId' | 'lessonId' | 'createdAt' | 'updatedAt'
	>
>

export class WatchHistory extends Class<WatchHistoryProps> {
	protected constructor(protected props: WatchHistoryProps) {
		super()
	}

	static async create({ idGenerator, input, id }: CreationParams) {
		const { createdAt = new Date(), updatedAt = new Date(), ...rest } = input

		if (!id) {
			id = await idGenerator.generate()
		}

		return new WatchHistory({
			id,
			createdAt,
			updatedAt,
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

	update(input: UpdateWatchHistoryInput): WatchHistory {
		return new WatchHistory({
			...this.props,
			...(input.userId !== undefined && { userId: input.userId }),
			...(input.watchedAt !== undefined && { watchedAt: input.watchedAt }),
			...(input.watchDuration !== undefined && {
				watchDuration: input.watchDuration,
			}),
			...(input.completed !== undefined && { completed: input.completed }),
			...(input.deviceInfo !== undefined && { deviceInfo: input.deviceInfo }),
			updatedAt: new Date(),
		})
	}
}
