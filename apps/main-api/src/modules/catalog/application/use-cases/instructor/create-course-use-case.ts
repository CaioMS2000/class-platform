import {
	type Result,
	type IdGenerator,
	UniqueId,
	UseCase,
	success,
	type Money,
} from '@repo/core'
import { Course } from '../../../domain/entities/course'
import { CourseRepository } from '../../repositories/course-repository'
import type { CourseLevel } from '../../../domain/@types'

export type InstructorCreateCourseUseCaseRequest = {
	instructorId: string
	title: string
	subtitle?: string
	description: string
	price: Money
	promotionalPrice?: Money
	level: CourseLevel
	thumbnail: string
}

export type InstructorCreateCourseUseCaseResponse = Result<
	never,
	{
		course: Course
	}
>

type UseCaseProps = {
	courseRepository: CourseRepository
	idGenerator: IdGenerator
}

export class InstructorCreateCourseUseCase extends UseCase<
	InstructorCreateCourseUseCaseRequest,
	InstructorCreateCourseUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
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
			price,
			promotionalPrice,
			level,
			thumbnail,
		} = input

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
			},
			idGenerator: this.props.idGenerator,
		})

		await this.props.courseRepository.save(course)

		return success({ course })
	}
}
