import { createSlug } from '@/utils/slug'
import { Class, type IdGenerator, type UniqueId } from '@repo/core'

export type CategoryProps = {
	id: UniqueId
	name: string
	slug: string
	description?: string
	parentId?: UniqueId
	icon?: string
}

type CreateCategoryInput = Optional<Omit<CategoryProps, 'id'>, 'slug'>

type CreationParams = {
	idGenerator: IdGenerator
	input: CreateCategoryInput
	id?: UniqueId
}

export type UpdateCategoryInput = Partial<Omit<CategoryProps, 'id' | 'slug'>>

export class Category extends Class<CategoryProps> {
	protected constructor(protected props: CategoryProps) {
		super()
	}

	static async create({ idGenerator, input, id }: CreationParams) {
		const { slug = createSlug(input.name), ...rest } = input

		if (!id) {
			id = await idGenerator.generate()
		}

		return new Category({
			id,
			slug,
			...rest,
		})
	}

	get id(): UniqueId {
		return this.props.id
	}

	get name(): string {
		return this.props.name
	}

	get slug(): string {
		return this.props.slug
	}

	get description(): string | undefined {
		return this.props.description
	}

	get icon(): string | undefined {
		return this.props.icon
	}

	get parentId(): UniqueId | undefined {
		return this.props.parentId
	}

	update(input: UpdateCategoryInput): Category {
		return new Category({
			...this.props,
			...(input.name !== undefined && {
				name: input.name,
				slug: createSlug(input.name),
			}),
			...(input.description !== undefined && {
				description: input.description,
			}),
			...(input.icon !== undefined && { icon: input.icon }),
			...(input.parentId !== undefined && { parentId: input.parentId }),
		})
	}
}
