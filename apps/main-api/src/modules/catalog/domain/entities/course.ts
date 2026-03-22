import { Class, type IdGenerator, type Money, type UniqueId } from '@repo/core'
import { resolveId } from '@/utils/resolve-id'
import { createSlug } from '@/utils/slug'
import type { CourseLevel, CourseStatus } from '../@types'
import { Rating } from '../value-objects'

export type CourseProps = {
	id: UniqueId
	instructorId: UniqueId
	slug: string // url-friendly name
	title: string
	subtitle?: string
	description: string
	thumbnail: string
	coverImage?: string

	// Conteúdo
	modulesIds: UniqueId[]
	totalLessons: number
	totalDuration: number // em minutos

	// Classificação
	categoriesIds: string[]
	tags: string[]
	level: CourseLevel

	// Preço
	price: Money
	promotionalPrice?: Money

	// Métricas
	rating: Rating
	totalRatings: number
	totalEnrollments: number

	// Status
	status: CourseStatus

	// Datas
	publishedAt?: Date
	createdAt: Date
	updatedAt: Date
}

export type CreateCourseInput = Pick<
	CourseProps,
	| 'instructorId'
	| 'title'
	| 'subtitle'
	| 'description'
	| 'price'
	| 'promotionalPrice'
	| 'level'
	| 'thumbnail'
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
			instructorId,
			slug,
			title,
			subtitle,
			description,
			thumbnail,
			coverImage,
			level,
			price,
			promotionalPrice,

			// with default
			totalRatings = 0,
			rating = Rating.zero(),
			totalEnrollments = 0,
			status = 'draft',
			publishedAt = undefined,
			createdAt = new Date(),
			updatedAt = new Date(),
			modulesIds = [],
			totalLessons = 0,
			totalDuration = 0,
			tags = [],
			categoriesIds = [],
		} = input

		id = await resolveId(idGenerator, id)
		slug = slug ?? createSlug(title)

		return new Course({
			id,
			instructorId,
			slug,
			title,
			subtitle,
			description,
			thumbnail,
			coverImage,
			level,
			price,
			promotionalPrice,
			updatedAt,
			totalRatings,
			rating,
			totalEnrollments,
			status,
			publishedAt,
			createdAt,
			modulesIds,
			totalLessons,
			totalDuration,
			tags,
			categoriesIds,
		})
	}

	get id(): UniqueId {
		return this.props.id
	}

	get instructorId(): UniqueId {
		return this.props.instructorId
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

	get tags(): string[] {
		return this.props.tags
	}

	get level(): CourseLevel {
		return this.props.level
	}

	get thumbnail(): string {
		return this.props.thumbnail
	}

	get price(): Money {
		return this.props.price
	}

	get promotionalPrice(): Money | undefined {
		return this.props.promotionalPrice
	}

	get status(): CourseStatus {
		return this.props.status
	}

	get slug(): string {
		return this.props.slug
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
			...(input.modulesIds !== undefined && { modulesIds: input.modulesIds }),
			...(input.totalLessons !== undefined && {
				totalLessons: input.totalLessons,
			}),
			...(input.totalDuration !== undefined && {
				totalDuration: input.totalDuration,
			}),
			...(input.categoriesIds !== undefined && {
				categoriesIds: input.categoriesIds,
			}),
			...(input.tags !== undefined && { tags: input.tags }),
			...(input.level !== undefined && { level: input.level }),
			...(input.price !== undefined && { price: input.price }),
			...('promotionalPrice' in input && {
				promotionalPrice: input.promotionalPrice,
			}),
			...(input.rating !== undefined && { rating: input.rating }),
			...(input.totalRatings !== undefined && {
				totalRatings: input.totalRatings,
			}),
			...(input.totalEnrollments !== undefined && {
				totalEnrollments: input.totalEnrollments,
			}),
			...(input.status !== undefined && { status: input.status }),
			...(input.publishedAt !== undefined && {
				publishedAt: input.publishedAt,
			}),
			updatedAt: new Date(),
		})
	}

	publish(): Course {
		return new Course({
			...this.props,
			status: 'published',
			publishedAt: new Date(),
		})
	}
}
