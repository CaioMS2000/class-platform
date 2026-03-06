import { Class, type Money, type UniqueId } from '@repo/core'
import type { Category, CourseStatus } from '../@types'

export type CouseProps = {
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

export type CreateCourseInput = Optional<CouseProps, 'id'>
export class Couse extends Class<CouseProps> {
	protected constructor(protected props: CouseProps) {
		super()
	}
}
