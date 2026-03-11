import { type Result, type IdGenerator, UseCase, success } from '@repo/core'
import { Admin } from '../../models/admin'
import { AdminRepository } from '../repositories/admin-repository'

export type CreateAdminUseCaseRequest = {
	email: string
	passwordHash: string
	name: string
	avatar?: string
}

export type CreateAdminUseCaseResponse = Result<never, { admin: Admin }>

type UseCaseProps = {
	adminRepository: AdminRepository
	idGenerator: IdGenerator
}

export class CreateAdminUseCase extends UseCase<
	CreateAdminUseCaseRequest,
	CreateAdminUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: CreateAdminUseCaseRequest
	): Promise<CreateAdminUseCaseResponse> {
		const { email, passwordHash, name, avatar } = input
		const admin = await Admin.create({
			idGenerator: this.props.idGenerator,
			input: { email, passwordHash, name, avatar },
		})
		await this.props.adminRepository.save(admin)
		return success({ admin })
	}
}
