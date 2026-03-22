import { failure, type Result, success, UniqueId, UseCase } from '@repo/core'
import type { Student } from '../../../models/student'
import { StudentNotFoundError } from '../../@errors'
import type { StudentRepository } from '../../repositories/student-repository'

export type GetStudentMyProfileUseCaseRequest = {
	requesterId: string
}

export type GetStudentMyProfileUseCaseResponse = Result<
	StudentNotFoundError,
	{ student: Student }
>

type UseCaseProps = { studentRepository: StudentRepository }

export class GetStudentMyProfileUseCase extends UseCase<
	GetStudentMyProfileUseCaseRequest,
	GetStudentMyProfileUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetStudentMyProfileUseCaseRequest
	): Promise<GetStudentMyProfileUseCaseResponse> {
		const student = await this.props.studentRepository.findById(
			UniqueId(input.requesterId)
		)
		if (!student) return failure(new StudentNotFoundError())
		return success({ student })
	}
}
