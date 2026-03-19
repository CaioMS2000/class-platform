import { type Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Student } from '../../../models/student'
import { StudentRepository } from '../../repositories/student-repository'
import { StudentNotFoundError } from '../../@errors'

export type GetStudentByAdminUseCaseRequest = { studentId: string }
export type GetStudentByAdminUseCaseResponse = Result<
	StudentNotFoundError,
	{ student: Student }
>

type UseCaseProps = { studentRepository: StudentRepository }

export class GetStudentByAdminUseCase extends UseCase<
	GetStudentByAdminUseCaseRequest,
	GetStudentByAdminUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetStudentByAdminUseCaseRequest
	): Promise<GetStudentByAdminUseCaseResponse> {
		const { studentId } = input
		const student = await this.props.studentRepository.findById(
			UniqueId(studentId)
		)
		if (!student) return failure(new StudentNotFoundError())
		return success({ student })
	}
}
