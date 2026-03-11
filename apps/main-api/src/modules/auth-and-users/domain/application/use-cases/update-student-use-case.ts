import { type Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Student } from '../../models/student'
import type { StudentStatus } from '../../models/@types'
import { StudentRepository } from '../repositories/student-repository'
import { StudentNotFoundError } from '../@errors'

export type UpdateStudentUseCaseRequest = {
	studentId: string
	name?: string
	avatar?: string
	status?: StudentStatus
}
export type UpdateStudentUseCaseResponse = Result<
	StudentNotFoundError,
	{ student: Student }
>

type UseCaseProps = { studentRepository: StudentRepository }

export class UpdateStudentUseCase extends UseCase<
	UpdateStudentUseCaseRequest,
	UpdateStudentUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: UpdateStudentUseCaseRequest
	): Promise<UpdateStudentUseCaseResponse> {
		const { studentId, name, avatar, status } = input
		const student = await this.props.studentRepository.findById(
			UniqueId(studentId)
		)
		if (!student) return failure(new StudentNotFoundError())
		const updatedStudent = student.update({ name, avatar, status })
		await this.props.studentRepository.update(updatedStudent)
		return success({ student: updatedStudent })
	}
}
