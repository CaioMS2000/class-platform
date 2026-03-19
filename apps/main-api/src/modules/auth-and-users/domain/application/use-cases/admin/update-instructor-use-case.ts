import { type Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Instructor } from '../../../models/instructor'
import type { InstructorStatus } from '../../../models/@types'
import { InstructorRepository } from '../../repositories/instructor-repository'
import { InstructorNotFoundError } from '../../@errors'

export type UpdateInstructorUseCaseRequest = {
	instructorId: string
	name?: string
	avatar?: string
	status?: InstructorStatus
}
export type UpdateInstructorUseCaseResponse = Result<
	InstructorNotFoundError,
	{ instructor: Instructor }
>

type UseCaseProps = { instructorRepository: InstructorRepository }

export class UpdateInstructorUseCase extends UseCase<
	UpdateInstructorUseCaseRequest,
	UpdateInstructorUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: UpdateInstructorUseCaseRequest
	): Promise<UpdateInstructorUseCaseResponse> {
		const { instructorId, name, avatar, status } = input
		const instructor = await this.props.instructorRepository.findById(
			UniqueId(instructorId)
		)
		if (!instructor) return failure(new InstructorNotFoundError())
		const updatedInstructor = instructor.update({ name, avatar, status })
		await this.props.instructorRepository.update(updatedInstructor)
		return success({ instructor: updatedInstructor })
	}
}
