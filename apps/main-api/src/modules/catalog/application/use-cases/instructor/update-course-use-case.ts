import {
	type Result,
	UseCase,
	UniqueId,
	success,
	failure,
	type Money,
} from '@repo/core'
import type { Course } from '../../../domain/entities/course'
import type { CourseRepository } from '../../repositories/course-repository'
import type { CategoryRepository } from '../../repositories/category-repository'
import {
	CategoryNotFoundError,
	CourseNotFoundError,
	NotCourseOwnerError,
} from '../../@errors'
import type { CourseLevel } from '../../../domain/@types'

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
	categoryIds?: string[]
}

export type InstructorUpdateCourseUseCaseResponse = Result<
	CourseNotFoundError | NotCourseOwnerError | CategoryNotFoundError,
	{
		course: Course
	}
>

type UseCaseProps = {
	courseRepository: CourseRepository
	categoryRepository: CategoryRepository
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
			categoryIds,
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

		let resolvedCategoryIds: ReturnType<typeof UniqueId>[] | undefined
		if (categoryIds !== undefined) {
			const found = await Promise.all(
				categoryIds.map(id =>
					this.props.categoryRepository.findById(UniqueId(id))
				)
			)
			if (found.some(c => c === null)) {
				return failure(new CategoryNotFoundError())
			}
			resolvedCategoryIds = (
				found as NonNullable<(typeof found)[number]>[]
			).map(c => c.id)
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
			categoriesIds: resolvedCategoryIds,
		})

		await this.props.courseRepository.update(updatedCourse)

		return success({ course: updatedCourse })
	}
}
