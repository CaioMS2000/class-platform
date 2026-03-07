import { Class, IdGenerator, type Money, type UniqueId } from '@repo/core'
import { resolveId } from '@/utils/resolve-id'
import { createSlug } from '@/utils/slug'
import type { Category, CourseStatus } from '../@types'

export type CourseProps = {
	id: UniqueId
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
	categories: Category[]
	tags: string[]
	level: 'beginner' | 'intermediate' | 'advanced'

	// Preço
	price: Money
	promotionalPrice?: Money

	// Métricas
	rating: number // média de 0-5
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
	| 'title'
	| 'subtitle'
	| 'description'
	| 'price'
	| 'promotionalPrice'
	| 'level'
	| 'thumbnail'
> &
	Partial<CourseProps>

type X = Optional<CourseProps, 'id'>
type CreationParams = {
	idGenerator: IdGenerator
	input: CreateCourseInput
}

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
			level,
			price,
			promotionalPrice,

			// with default
			totalRatings = 0,
			rating = 0,
			totalEnrollments = 0,
			status = 'published',
			publishedAt = new Date(),
			createdAt = new Date(),
			updatedAt = new Date(),
			modulesIds = [],
			totalLessons = 0,
			totalDuration = 0,
			tags = [],
			categories = [],
		} = input

		id = await resolveId(idGenerator, id)
		slug = slug ?? createSlug(title)

		return new Course({
			id,
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
			categories,
		})
	}
}
