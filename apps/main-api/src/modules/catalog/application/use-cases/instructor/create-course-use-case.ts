import {
	type Result,
	type IdGenerator,
	UniqueId,
	UseCase,
	success,
	failure,
	Money,
	InvalidValueError,
} from '@repo/core'
import { Course } from '../../../domain/entities/course'
import type { CourseRepository } from '../../repositories/course-repository'
import type { CourseLevel } from '../../../domain/@types'
import type { CategoryRepository } from '../../repositories/category-repository'
import { CategoryNotFoundError } from '../../@errors'
import type { Currency } from '@repo/core/domain/@types/currency'

type MoneyReference = {
	amount: number
	currency: Currency
}
export type InstructorCreateCourseUseCaseRequest = {
	instructorId: string
	title: string
	subtitle?: string
	description: string
	price: MoneyReference
	promotionalPrice?: MoneyReference
	level: CourseLevel
	thumbnail: string
	categoryIds?: string[]
}

export type InstructorCreateCourseUseCaseResponse = Result<
	CategoryNotFoundError | InvalidValueError,
	{
		course: Course
	}
>

type UseCaseProps = {
	courseRepository: CourseRepository
	idGenerator: IdGenerator
	categoryRepository: CategoryRepository
}

export class InstructorCreateCourseUseCase extends UseCase<
	InstructorCreateCourseUseCaseRequest,
	InstructorCreateCourseUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: InstructorCreateCourseUseCaseRequest
	): Promise<InstructorCreateCourseUseCaseResponse> {
		const {
			instructorId,
			title,
			subtitle,
			description,
			price: _price,
			promotionalPrice: _promotionalPrice,
			level,
			thumbnail,
			categoryIds = [],
		} = input

		const categories = await Promise.all(
			categoryIds.map(id =>
				this.props.categoryRepository.findById(UniqueId(id))
			)
		)

		if (categories.some(c => c === null)) {
			return failure(new CategoryNotFoundError())
		}

		let price: Money
		let promotionalPrice: Money | undefined

		const createPriceResult = Money.create(_price.amount, _price.currency)

		if (createPriceResult.isFailure()) {
			return failure(createPriceResult.value)
		}

		price = createPriceResult.value

		if (_promotionalPrice) {
			const createPromotionalPriceResult = Money.create(
				_promotionalPrice.amount,
				_promotionalPrice.currency
			)
			if (createPromotionalPriceResult.isFailure()) {
				return failure(createPromotionalPriceResult.value)
			}
			promotionalPrice = createPromotionalPriceResult.value
		}

		const course = await Course.create({
			input: {
				instructorId: UniqueId(instructorId),
				title,
				subtitle,
				description,
				price,
				promotionalPrice,
				level,
				thumbnail,
				categoriesIds: (
					categories as NonNullable<(typeof categories)[number]>[]
				).map(c => c.id),
			},
			idGenerator: this.props.idGenerator,
		})

		await this.props.courseRepository.save(course)

		return success({ course })
	}
}
