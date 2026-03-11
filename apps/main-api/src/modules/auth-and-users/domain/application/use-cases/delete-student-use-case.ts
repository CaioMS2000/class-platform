import { type Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { StudentRepository } from '../repositories/student-repository'
import { StudentNotFoundError } from '../@errors'

export type DeleteStudentUseCaseRequest = { studentId: string }
export type DeleteStudentUseCaseResponse = Result<StudentNotFoundError, null>

type UseCaseProps = { studentRepository: StudentRepository }

export class DeleteStudentUseCase extends UseCase<
	DeleteStudentUseCaseRequest,
	DeleteStudentUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: DeleteStudentUseCaseRequest
	): Promise<DeleteStudentUseCaseResponse> {
		const { studentId } = input
		const student = await this.props.studentRepository.findById(
			UniqueId(studentId)
		)
		if (!student) return failure(new StudentNotFoundError())
		await this.props.studentRepository.delete(student)
		return success(null)
	}
}
