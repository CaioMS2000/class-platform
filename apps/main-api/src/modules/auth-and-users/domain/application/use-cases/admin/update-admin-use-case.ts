import { type Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Admin } from '../../../models/admin'
import type { AdminStatus } from '../../../models/@types'
import { AdminRepository } from '../../repositories/admin-repository'
import { AdminNotFoundError } from '../../@errors'

export type UpdateAdminUseCaseRequest = {
	adminId: string
	name?: string
	avatar?: string
	status?: AdminStatus
}
export type UpdateAdminUseCaseResponse = Result<
	AdminNotFoundError,
	{ admin: Admin }
>

type UseCaseProps = { adminRepository: AdminRepository }

export class UpdateAdminUseCase extends UseCase<
	UpdateAdminUseCaseRequest,
	UpdateAdminUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: UpdateAdminUseCaseRequest
	): Promise<UpdateAdminUseCaseResponse> {
		const { adminId, name, avatar, status } = input
		const admin = await this.props.adminRepository.findById(UniqueId(adminId))
		if (!admin) return failure(new AdminNotFoundError())
		const updatedAdmin = admin.update({ name, avatar, status })
		await this.props.adminRepository.update(updatedAdmin)
		return success({ admin: updatedAdmin })
	}
}
