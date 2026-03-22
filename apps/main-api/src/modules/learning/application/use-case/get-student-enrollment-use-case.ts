import { failure, type Result, success, UniqueId, UseCase } from '@repo/core'
import type { Enrollment } from '../../domain/models/enrollment'
import { CourseNotFoundError, StudentNotFoundError } from '../@errors'
import type { CourseRepository } from '../repositories/course-repository'
import type { EnrollmentRepository } from '../repositories/enrollment-repository'
import type { StudentRepository } from '../repositories/student-repository'

export type GetStudentEnrollmentUseCaseRequest = {
	studentId: string
	courseId: string
}

export type GetStudentEnrollmentUseCaseResponse = Result<
	StudentNotFoundError | CourseNotFoundError,
	{
		enrollment: Enrollment | null
	}
>

type UseCaseProps = {
	studentRepository: StudentRepository
	courseRepository: CourseRepository
	enrollmentRepository: EnrollmentRepository
}

export class GetStudentEnrollmentUseCase extends UseCase<
	GetStudentEnrollmentUseCaseRequest,
	GetStudentEnrollmentUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetStudentEnrollmentUseCaseRequest
	): Promise<GetStudentEnrollmentUseCaseResponse> {
		const student = await this.props.studentRepository.findById(input.studentId)

		if (!student) return failure(new StudentNotFoundError())

		const course = await this.props.courseRepository.findById(input.courseId)

		if (!course) return failure(new CourseNotFoundError())

		const existingEnrollment =
			await this.props.enrollmentRepository.findStudentCourseEnrollment(
				UniqueId(input.studentId),
				UniqueId(input.courseId)
			)

		return success({ enrollment: existingEnrollment })
	}
}
