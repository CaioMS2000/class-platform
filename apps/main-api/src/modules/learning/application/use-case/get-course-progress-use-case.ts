import { failure, type Result, success, UniqueId, UseCase } from '@repo/core'
import type { Enrollment } from '../../domain/models/enrollment'
import type { Progress } from '../../domain/models/progress'
import { EnrollmentNotFoundError } from '../@errors'
import type { EnrollmentRepository } from '../repositories/enrollment-repository'
import type { ProgressRepository } from '../repositories/progress-repository'

export type GetCourseProgressUseCaseRequest = {
	studentId: string
	courseId: string
}

export type GetCourseProgressUseCaseResponse = Result<
	EnrollmentNotFoundError,
	{
		enrollment: Enrollment
		progressRecords: Progress[]
	}
>

type UseCaseProps = {
	enrollmentRepository: EnrollmentRepository
	progressRepository: ProgressRepository
}

export class GetCourseProgressUseCase extends UseCase<
	GetCourseProgressUseCaseRequest,
	GetCourseProgressUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetCourseProgressUseCaseRequest
	): Promise<GetCourseProgressUseCaseResponse> {
		const enrollment =
			await this.props.enrollmentRepository.findStudentCourseEnrollment(
				UniqueId(input.studentId),
				UniqueId(input.courseId)
			)

		if (!enrollment) return failure(new EnrollmentNotFoundError())

		const progressRecords =
			await this.props.progressRepository.findManyByUserAndCourse(
				UniqueId(input.studentId),
				UniqueId(input.courseId)
			)

		return success({ enrollment, progressRecords })
	}
}
