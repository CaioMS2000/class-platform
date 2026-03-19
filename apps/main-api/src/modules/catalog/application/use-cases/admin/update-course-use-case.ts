import { Result, UseCase, UniqueId, success, failure, Money } from '@repo/core'
import { Course } from '../../../domain/entities/course'
import { CourseRepository } from '../../repositories/course-repository'
import { CourseNotFoundError } from '../../@errors'
import { CourseLevel, CourseStatus } from '../../../domain/@types'

export type UpdateCourseUseCaseRequest = {
	courseId: string
	title?: string
	subtitle?: string
	description?: string
	price?: Money
	promotionalPrice?: Money
	level?: CourseLevel
	thumbnail?: string
	coverImage?: string
	status?: CourseStatus
	tags?: string[]
}

export type UpdateCourseUseCaseResponse = Result<
	CourseNotFoundError,
	{
		course: Course
	}
>

type UseCaseProps = {
	courseRepository: CourseRepository
}

export class UpdateCourseUseCase extends UseCase<
	UpdateCourseUseCaseRequest,
	UpdateCourseUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: UpdateCourseUseCaseRequest
	): Promise<UpdateCourseUseCaseResponse> {
		const {
			courseId,
			title,
			subtitle,
			description,
			price,
			promotionalPrice,
			level,
			thumbnail,
			coverImage,
			status,
			tags,
		} = input

		const course = await this.props.courseRepository.findById(
			UniqueId(courseId)
		)

		if (!course) {
			return failure(new CourseNotFoundError())
		}

		const updatedCourse = course.update({
			title,
			subtitle,
			description,
			price,
			promotionalPrice,
			level,
			thumbnail,
			coverImage,
			status,
			tags,
		})

		await this.props.courseRepository.update(updatedCourse)

		return success({ course: updatedCourse })
	}
}
