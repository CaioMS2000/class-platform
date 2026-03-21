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
import { CategoryNotFoundError, CourseNotFoundError } from '../../@errors'
import type { CourseLevel, CourseStatus } from '../../../domain/@types'

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
	categoryIds?: string[]
}

export type UpdateCourseUseCaseResponse = Result<
	CourseNotFoundError | CategoryNotFoundError,
	{
		course: Course
	}
>

type UseCaseProps = {
	courseRepository: CourseRepository
	categoryRepository: CategoryRepository
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
			categoryIds,
		} = input

		const course = await this.props.courseRepository.findById(
			UniqueId(courseId)
		)

		if (!course) {
			return failure(new CourseNotFoundError())
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
			status,
			tags,
			categoriesIds: resolvedCategoryIds,
		})

		await this.props.courseRepository.update(updatedCourse)

		return success({ course: updatedCourse })
	}
}
