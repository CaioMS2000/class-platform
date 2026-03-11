import { type Result, UseCase, success } from '@repo/core'
import { Student } from '../../models/student'
import {
	StudentRepository,
	StudentFilters,
} from '../repositories/student-repository'
import { Pagination } from '../repositories/params'

export type GetAllStudentsUseCaseRequest = {
	filters?: StudentFilters
	pagination?: Pagination
}
export type GetAllStudentsUseCaseResponse = Result<
	never,
	{ students: Student[] }
>

type UseCaseProps = { studentRepository: StudentRepository }

export class GetAllStudentsUseCase extends UseCase<
	GetAllStudentsUseCaseRequest,
	GetAllStudentsUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetAllStudentsUseCaseRequest
	): Promise<GetAllStudentsUseCaseResponse> {
		const { filters, pagination } = input
		const students = await this.props.studentRepository.findMany(
			filters,
			pagination
		)
		return success({ students })
	}
}
