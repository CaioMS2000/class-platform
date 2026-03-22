import { failure, type Result, success, UniqueId, UseCase } from '@repo/core'
import type { Enrollment } from '../../domain/models/enrollment'
import { StudentNotFoundError } from '../@errors'
import type { EnrollmentRepository } from '../repositories/enrollment-repository'
import type { StudentRepository } from '../repositories/student-repository'

export type ListStudentEnrollmentsUseCaseRequest = {
	studentId: string
}

export type ListStudentEnrollmentsUseCaseResponse = Result<
	StudentNotFoundError,
	{
		enrollments: Enrollment[]
	}
>

type UseCaseProps = {
	studentRepository: StudentRepository
	enrollmentRepository: EnrollmentRepository
}

export class ListStudentEnrollmentsUseCase extends UseCase<
	ListStudentEnrollmentsUseCaseRequest,
	ListStudentEnrollmentsUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: ListStudentEnrollmentsUseCaseRequest
	): Promise<ListStudentEnrollmentsUseCaseResponse> {
		const student = await this.props.studentRepository.findById(input.studentId)

		if (!student) return failure(new StudentNotFoundError())

		const enrollments = await this.props.enrollmentRepository.findManyByStudent(
			UniqueId(input.studentId)
		)

		return success({ enrollments })
	}
}
