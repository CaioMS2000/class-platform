import {
	type Result,
	type FailureOf,
	UseCase,
	UniqueId,
	success,
	failure,
} from '@repo/core'
import type { Course } from '../../../domain/entities/course'
import type { CourseRepository } from '../../repositories/course-repository'
import type { ModuleRepository } from '../../repositories/module-repository'
import { CourseNotFoundError, NotCourseOwnerError } from '../../@errors'
import type { CoursePublicationService } from '@/modules/catalog/domain/domain-services/course-publication-service'

export type InstructorPublishCourseUseCaseRequest = {
	courseId: string
	instructorId: string
}

export type InstructorPublishCourseUseCaseResponse = Result<
	| CourseNotFoundError
	| NotCourseOwnerError
	| FailureOf<ReturnType<CoursePublicationService['publish']>>,
	{
		course: Course
	}
>

type UseCaseProps = {
	courseRepository: CourseRepository
	moduleRepository: ModuleRepository
	coursePublicationService: CoursePublicationService
}

export class InstructorPublishCourseUseCase extends UseCase<
	InstructorPublishCourseUseCaseRequest,
	InstructorPublishCourseUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: InstructorPublishCourseUseCaseRequest
	): Promise<InstructorPublishCourseUseCaseResponse> {
		const { courseId, instructorId } = input

		const course = await this.props.courseRepository.findById(
			UniqueId(courseId)
		)

		if (!course) {
			return failure(new CourseNotFoundError())
		}

		if (course.instructorId !== UniqueId(instructorId)) {
			return failure(new NotCourseOwnerError())
		}

		const modules = await this.props.moduleRepository.findManyByCourseId(
			course.id
		)
		const publishResult = this.props.coursePublicationService.publish(
			course,
			modules
		)

		if (publishResult.isFailure()) {
			return failure(publishResult.value)
		}

		const updatedCourse = publishResult.value

		await this.props.courseRepository.update(updatedCourse)

		return success({ course: updatedCourse })
	}
}
