import { Result, IdGenerator, UseCase, success, Money } from '@repo/core'
import { Course } from '../../domain/entities/course'
import { CourseRepository } from '../repositories/course-repository'
import { CourseLevel } from '../../domain/@types'

export type CreateCourseUseCaseRequest = {
	title: string
	subtitle?: string
	description: string
	price: Money
	promotionalPrice?: Money
	level: CourseLevel
	thumbnail: string
}

export type CreateCourseUseCaseResponse = Result<
	never,
	{
		course: Course
	}
>

type UseCaseProps = {
	courseRepository: CourseRepository
	idGenerator: IdGenerator
}

export class CreateCourseUseCase extends UseCase<
	CreateCourseUseCaseRequest,
	CreateCourseUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: CreateCourseUseCaseRequest
	): Promise<CreateCourseUseCaseResponse> {
		const {
			title,
			subtitle,
			description,
			price,
			promotionalPrice,
			level,
			thumbnail,
		} = input

		const course = await Course.create({
			input: {
				title,
				subtitle,
				description,
				price,
				promotionalPrice,
				level,
				thumbnail,
			},
			idGenerator: this.props.idGenerator,
		})

		await this.props.courseRepository.save(course)

		return success({ course })
	}
}
