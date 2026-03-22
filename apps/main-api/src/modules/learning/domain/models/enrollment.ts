import { Class, type IdGenerator, type UniqueId } from '@repo/core'
import type { EnrollmentProgressValue } from '../value-objects'
import type { EnrollmentStatus } from './@types'

export type EnrollmentProps = {
	id: UniqueId
	userId: UniqueId
	courseId: UniqueId
	status: EnrollmentStatus

	// Progresso
	progressValue: EnrollmentProgressValue
	completedLessons: number
	totalLessons: number

	// Acesso
	enrolledAt: Date
	expiresAt?: Date // se tiver prazo
	lastAccessAt?: Date

	// Certificado
	certificateIssued?: boolean
	certificateUrl?: string
	completedAt?: Date

	createdAt: Date
	updatedAt: Date
}

type CreateEnrollmentInput = Optional<
	Omit<EnrollmentProps, 'id'>,
	'createdAt' | 'updatedAt'
>

type CreationParams = {
	idGenerator: IdGenerator
	input: CreateEnrollmentInput
	id?: UniqueId
}

export type UpdateEnrollmentInput = Partial<
	Omit<
		EnrollmentProps,
		'id' | 'courseId' | 'moduleId' | 'createdAt' | 'updatedAt'
	>
>

export class Enrollment extends Class<EnrollmentProps> {
	protected constructor(protected props: EnrollmentProps) {
		super()
	}

	static async create({ idGenerator, input, id }: CreationParams) {
		const { createdAt = new Date(), updatedAt = new Date(), ...rest } = input

		if (!id) {
			id = await idGenerator.generate()
		}

		return new Enrollment({
			id,
			createdAt,
			updatedAt,
			...rest,
		})
	}

	get id(): UniqueId {
		return this.props.id
	}

	get courseId(): UniqueId {
		return this.props.courseId
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date {
		return this.props.updatedAt
	}

	update(input: UpdateEnrollmentInput): Enrollment {
		return new Enrollment({
			...this.props,
			updatedAt: new Date(),
		})
	}
}
