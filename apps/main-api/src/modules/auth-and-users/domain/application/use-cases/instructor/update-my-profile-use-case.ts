import { failure, type Result, success, UniqueId, UseCase } from '@repo/core'
import type { Instructor } from '../../../models/instructor'
import { InstructorNotFoundError } from '../../@errors'
import type { InstructorRepository } from '../../repositories/instructor-repository'

export type UpdateInstructorMyProfileUseCaseRequest = {
	requesterId: string
	name?: string
	avatar?: string
}

export type UpdateInstructorMyProfileUseCaseResponse = Result<
	InstructorNotFoundError,
	{ instructor: Instructor }
>

type UseCaseProps = { instructorRepository: InstructorRepository }

export class UpdateInstructorMyProfileUseCase extends UseCase<
	UpdateInstructorMyProfileUseCaseRequest,
	UpdateInstructorMyProfileUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: UpdateInstructorMyProfileUseCaseRequest
	): Promise<UpdateInstructorMyProfileUseCaseResponse> {
		const { requesterId, name, avatar } = input
		const instructor = await this.props.instructorRepository.findById(
			UniqueId(requesterId)
		)
		if (!instructor) return failure(new InstructorNotFoundError())
		const updatedInstructor = instructor.update({ name, avatar })
		await this.props.instructorRepository.update(updatedInstructor)
		return success({ instructor: updatedInstructor })
	}
}
