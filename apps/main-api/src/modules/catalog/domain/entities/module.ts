import { Class, type IdGenerator, type UniqueId } from '@repo/core'

export type ModuleProps = {
	id: UniqueId
	courseId: UniqueId
	order: number
	title: string
	description?: string
	lessonsIds: UniqueId[]

	// Métricas
	totalLessons: number
	totalDuration: number

	createdAt: Date
	updatedAt: Date
}

type CreateModuleInput = Optional<
	Omit<ModuleProps, 'id'>,
	'createdAt' | 'updatedAt' | 'lessonsIds' | 'totalLessons' | 'totalDuration'
>

type CreationParams = {
	idGenerator: IdGenerator
	input: CreateModuleInput
	id?: UniqueId
}

export type UpdateModuleInput = Partial<
	Omit<
		ModuleProps,
		| 'id'
		| 'courseId'
		| 'lessonsIds'
		| 'totalLessons'
		| 'totalDuration'
		| 'createdAt'
		| 'updatedAt'
	>
>

export class Module extends Class<ModuleProps> {
	protected constructor(protected props: ModuleProps) {
		super()
	}

	static async create({ idGenerator, input, id }: CreationParams) {
		const {
			createdAt = new Date(),
			updatedAt = new Date(),
			lessonsIds = [],
			totalLessons = 0,
			totalDuration = 0,
			...rest
		} = input

		if (!id) {
			id = await idGenerator.generate()
		}

		return new Module({
			id,
			createdAt,
			updatedAt,
			lessonsIds,
			totalLessons,
			totalDuration,
			...rest,
		})
	}

	get id(): UniqueId {
		return this.props.id
	}

	get title(): string {
		return this.props.title
	}

	get order(): number {
		return this.props.order
	}

	get description(): string | undefined {
		return this.props.description
	}

	get courseId(): UniqueId {
		return this.props.courseId
	}

	update(input: UpdateModuleInput): Module {
		return new Module({
			...this.props,
			...(input.title !== undefined && { title: input.title }),
			...(input.description !== undefined && {
				description: input.description,
			}),
			...(input.order !== undefined && { order: input.order }),
			updatedAt: new Date(),
		})
	}
}
