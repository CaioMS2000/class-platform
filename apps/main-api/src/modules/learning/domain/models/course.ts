import { Class, type IdGenerator, type UniqueId } from '@repo/core'
import { resolveId } from '@/utils/resolve-id'
import { createSlug } from '@/utils/slug'

export type CourseProps = {
	id: UniqueId
	slug: string // url-friendly name
	title: string
	subtitle?: string
	description: string
	thumbnail: string
	coverImage?: string
	totalLessons: number

	// Datas
	publishedAt?: Date
	createdAt: Date
	updatedAt: Date
}

export type CreateCourseInput = Pick<
	CourseProps,
	'title' | 'subtitle' | 'description' | 'thumbnail' | 'totalLessons'
> &
	Partial<CourseProps>

type CreationParams = {
	idGenerator: IdGenerator
	input: CreateCourseInput
}

export type UpdateCourseInput = Partial<
	Omit<CourseProps, 'id' | 'createdAt' | 'updatedAt'>
>

export class Course extends Class<CourseProps> {
	protected constructor(protected props: CourseProps) {
		super()
	}

	static async create({ idGenerator, input }: CreationParams) {
		let {
			id,
			slug,
			title,
			subtitle,
			description,
			thumbnail,
			coverImage,
			totalLessons,

			// with default
			publishedAt = undefined,
			createdAt = new Date(),
			updatedAt = new Date(),
		} = input

		id = await resolveId(idGenerator, id)
		slug = slug ?? createSlug(title)

		return new Course({
			id,
			slug,
			title,
			subtitle,
			description,
			totalLessons,
			thumbnail,
			coverImage,
			updatedAt,
			publishedAt,
			createdAt,
		})
	}

	get id(): UniqueId {
		return this.props.id
	}

	get title(): string {
		return this.props.title
	}

	get subtitle(): string | undefined {
		return this.props.subtitle
	}

	get description(): string {
		return this.props.description
	}

	get coverImage(): string | undefined {
		return this.props.coverImage
	}

	get slug(): string {
		return this.props.slug
	}
	get thumbnail(): string {
		return this.props.thumbnail
	}

	get totalLessons() {
		return this.props.totalLessons
	}

	get publishedAt(): Date | undefined {
		return this.props.publishedAt
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date {
		return this.props.updatedAt
	}

	update(input: UpdateCourseInput): Course {
		return new Course({
			...this.props,
			...(input.slug !== undefined && { slug: input.slug }),
			...(input.title !== undefined && { title: input.title }),
			...(input.subtitle !== undefined && { subtitle: input.subtitle }),
			...(input.description !== undefined && {
				description: input.description,
			}),
			...(input.thumbnail !== undefined && { thumbnail: input.thumbnail }),
			...(input.coverImage !== undefined && { coverImage: input.coverImage }),
			...(input.publishedAt !== undefined && {
				publishedAt: input.publishedAt,
			}),
			updatedAt: new Date(),
		})
	}
}
