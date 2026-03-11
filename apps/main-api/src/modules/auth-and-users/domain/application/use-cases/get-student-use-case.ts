import { type Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Student } from '../../models/student'
import { StudentRepository } from '../repositories/student-repository'
import { StudentNotFoundError } from '../@errors'

export type GetStudentUseCaseRequest = { studentId: string }
export type GetStudentUseCaseResponse = Result<
	StudentNotFoundError,
	{ student: Student }
>

type UseCaseProps = { studentRepository: StudentRepository }

export class GetStudentUseCase extends UseCase<
	GetStudentUseCaseRequest,
	GetStudentUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetStudentUseCaseRequest
	): Promise<GetStudentUseCaseResponse> {
		const { studentId } = input
		const student = await this.props.studentRepository.findById(
			UniqueId(studentId)
		)
		if (!student) return failure(new StudentNotFoundError())
		return success({ student })
	}
}
