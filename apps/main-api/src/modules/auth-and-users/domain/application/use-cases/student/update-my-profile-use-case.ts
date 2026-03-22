import { failure, type Result, success, UniqueId, UseCase } from '@repo/core'
import type { Student } from '../../../models/student'
import { StudentNotFoundError } from '../../@errors'
import type { StudentRepository } from '../../repositories/student-repository'

export type UpdateStudentMyProfileUseCaseRequest = {
	requesterId: string
	name?: string
	avatar?: string
}

export type UpdateStudentMyProfileUseCaseResponse = Result<
	StudentNotFoundError,
	{ student: Student }
>

type UseCaseProps = { studentRepository: StudentRepository }

export class UpdateStudentMyProfileUseCase extends UseCase<
	UpdateStudentMyProfileUseCaseRequest,
	UpdateStudentMyProfileUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: UpdateStudentMyProfileUseCaseRequest
	): Promise<UpdateStudentMyProfileUseCaseResponse> {
		const { requesterId, name, avatar } = input
		const student = await this.props.studentRepository.findById(
			UniqueId(requesterId)
		)
		if (!student) return failure(new StudentNotFoundError())
		const updatedStudent = student.update({ name, avatar })
		await this.props.studentRepository.update(updatedStudent)
		return success({ student: updatedStudent })
	}
}
