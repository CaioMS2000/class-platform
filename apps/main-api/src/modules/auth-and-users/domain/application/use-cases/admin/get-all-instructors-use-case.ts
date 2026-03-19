import { type Result, UseCase, success } from '@repo/core'
import { Instructor } from '../../../models/instructor'
import {
	InstructorRepository,
	InstructorFilters,
} from '../../repositories/instructor-repository'
import { Pagination } from '../../repositories/params'

export type GetAllInstructorsUseCaseRequest = {
	filters?: InstructorFilters
	pagination?: Pagination
}
export type GetAllInstructorsUseCaseResponse = Result<
	never,
	{ instructors: Instructor[] }
>

type UseCaseProps = { instructorRepository: InstructorRepository }

export class GetAllInstructorsUseCase extends UseCase<
	GetAllInstructorsUseCaseRequest,
	GetAllInstructorsUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetAllInstructorsUseCaseRequest
	): Promise<GetAllInstructorsUseCaseResponse> {
		const { filters, pagination } = input
		const instructors = await this.props.instructorRepository.findMany(
			filters,
			pagination
		)
		return success({ instructors })
	}
}
