import { failure, type Result, success, UniqueId, UseCase } from '@repo/core'
import type { Instructor } from '../../../models/instructor'
import { InstructorNotFoundError } from '../../@errors'
import type { InstructorRepository } from '../../repositories/instructor-repository'

export type GetInstructorMyProfileUseCaseRequest = {
	requesterId: string
}

export type GetInstructorMyProfileUseCaseResponse = Result<
	InstructorNotFoundError,
	{ instructor: Instructor }
>

type UseCaseProps = { instructorRepository: InstructorRepository }

export class GetInstructorMyProfileUseCase extends UseCase<
	GetInstructorMyProfileUseCaseRequest,
	GetInstructorMyProfileUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetInstructorMyProfileUseCaseRequest
	): Promise<GetInstructorMyProfileUseCaseResponse> {
		const instructor = await this.props.instructorRepository.findById(
			UniqueId(input.requesterId)
		)
		if (!instructor) return failure(new InstructorNotFoundError())
		return success({ instructor })
	}
}
