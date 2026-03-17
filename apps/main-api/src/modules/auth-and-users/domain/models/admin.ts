import { Class, type IdGenerator, type UniqueId } from '@repo/core'
import type { AdminStatus } from './@types'

export type AdminProps = {
	id: UniqueId
	email: string
	passwordHash: string | null
	name: string
	avatar?: string
	status: AdminStatus

	// Metadados
	emailVerifiedAt?: Date
	lastLoginAt?: Date
	lastLoginIp?: string
	createdAt: Date
	updatedAt: Date
}

type CreateAdminInput = Optional<
	Omit<AdminProps, 'id'>,
	'status' | 'createdAt' | 'updatedAt'
>

type CreationParams = {
	idGenerator: IdGenerator
	input: CreateAdminInput
	id?: UniqueId
}

export type UpdateAdminInput = Partial<
	Pick<
		AdminProps,
		| 'name'
		| 'avatar'
		| 'status'
		| 'emailVerifiedAt'
		| 'lastLoginAt'
		| 'lastLoginIp'
	>
>

export class Admin extends Class<AdminProps> {
	protected constructor(protected props: AdminProps) {
		super()
	}

	static async create({ idGenerator, input, id }: CreationParams) {
		const {
			status = 'pending',
			createdAt = new Date(),
			updatedAt = new Date(),
			...rest
		} = input

		if (!id) {
			id = await idGenerator.generate()
		}

		return new Admin({ id, status, createdAt, updatedAt, ...rest })
	}

	get id(): UniqueId {
		return this.props.id
	}

	get email(): string {
		return this.props.email
	}

	get passwordHash(): string | null {
		return this.props.passwordHash
	}

	get name(): string {
		return this.props.name
	}

	get avatar(): string | undefined {
		return this.props.avatar
	}

	get status(): AdminStatus {
		return this.props.status
	}

	get emailVerifiedAt(): Date | undefined {
		return this.props.emailVerifiedAt
	}

	get lastLoginAt(): Date | undefined {
		return this.props.lastLoginAt
	}

	get lastLoginIp(): string | undefined {
		return this.props.lastLoginIp
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date {
		return this.props.updatedAt
	}

	update(input: UpdateAdminInput): Admin {
		return new Admin({
			...this.props,
			...(input.name !== undefined && { name: input.name }),
			...(input.avatar !== undefined && { avatar: input.avatar }),
			...(input.status !== undefined && { status: input.status }),
			...(input.emailVerifiedAt !== undefined && {
				emailVerifiedAt: input.emailVerifiedAt,
			}),
			...(input.lastLoginAt !== undefined && {
				lastLoginAt: input.lastLoginAt,
			}),
			...(input.lastLoginIp !== undefined && {
				lastLoginIp: input.lastLoginIp,
			}),
			updatedAt: new Date(),
		})
	}
}
