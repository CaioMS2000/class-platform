import { Result, UseCase, UniqueId, success, failure, Money } from '@repo/core'
import { Course } from '../../../domain/entities/course'
import { CourseRepository } from '../../repositories/course-repository'
import { CourseNotFoundError, NotCourseOwnerError } from '../../@errors'
import { CourseLevel } from '../../../domain/@types'

export type InstructorUpdateCourseUseCaseRequest = {
	courseId: string
	instructorId: string
	title?: string
	subtitle?: string
	description?: string
	price?: Money
	promotionalPrice?: Money
	level?: CourseLevel
	thumbnail?: string
	coverImage?: string
	tags?: string[]
}

export type InstructorUpdateCourseUseCaseResponse = Result<
	CourseNotFoundError | NotCourseOwnerError,
	{
		course: Course
	}
>

type UseCaseProps = {
	courseRepository: CourseRepository
}

export class InstructorUpdateCourseUseCase extends UseCase<
	InstructorUpdateCourseUseCaseRequest,
	InstructorUpdateCourseUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: InstructorUpdateCourseUseCaseRequest
	): Promise<InstructorUpdateCourseUseCaseResponse> {
		const {
			courseId,
			instructorId,
			title,
			subtitle,
			description,
			price,
			promotionalPrice,
			level,
			thumbnail,
			coverImage,
			tags,
		} = input

		const course = await this.props.courseRepository.findById(
			UniqueId(courseId)
		)

		if (!course) {
			return failure(new CourseNotFoundError())
		}

		if (course.instructorId !== UniqueId(instructorId)) {
			return failure(new NotCourseOwnerError())
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
			tags,
		})

		await this.props.courseRepository.update(updatedCourse)

		return success({ course: updatedCourse })
	}
}
