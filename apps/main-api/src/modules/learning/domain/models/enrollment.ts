import { Class, type IdGenerator, type UniqueId } from '@repo/core'
import { EnrollmentProgressValue } from '../value-objects'
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
	| 'createdAt'
	| 'updatedAt'
	| 'status'
	| 'progressValue'
	| 'completedLessons'
	| 'enrolledAt'
	| 'certificateIssued'
	| 'certificateUrl'
	| 'completedAt'
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
		const {
			createdAt = new Date(),
			updatedAt = new Date(),
			status = 'active',
			progressValue = EnrollmentProgressValue.zero(),
			completedLessons = 0,
			enrolledAt = new Date(),
			certificateIssued = false,
			...rest
		} = input

		if (!id) {
			id = await idGenerator.generate()
		}

		return new Enrollment({
			id,
			createdAt,
			updatedAt,
			status,
			progressValue,
			completedLessons,
			enrolledAt,
			certificateIssued,
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

	get status(): EnrollmentStatus {
		return this.props.status
	}

	get completedLessons(): number {
		return this.props.completedLessons
	}

	get totalLessons(): number {
		return this.props.totalLessons
	}

	get progressValue(): EnrollmentProgressValue {
		return this.props.progressValue
	}

	get userId(): UniqueId {
		return this.props.userId
	}

	get enrolledAt(): Date {
		return this.props.enrolledAt
	}

	get expiresAt(): Date | undefined {
		return this.props.expiresAt
	}

	get lastAccessAt(): Date | undefined {
		return this.props.lastAccessAt
	}

	get certificateIssued(): boolean {
		return this.props.certificateIssued ?? false
	}

	get certificateUrl(): string | undefined {
		return this.props.certificateUrl
	}

	get completedAt(): Date | undefined {
		return this.props.completedAt
	}

	update(input: UpdateEnrollmentInput): Enrollment {
		return new Enrollment({
			...this.props,
			...(input.userId !== undefined && { userId: input.userId }),
			...(input.status !== undefined && { status: input.status }),
			...(input.progressValue !== undefined && {
				progressValue: input.progressValue,
			}),
			...(input.completedLessons !== undefined && {
				completedLessons: input.completedLessons,
			}),
			...(input.totalLessons !== undefined && {
				totalLessons: input.totalLessons,
			}),
			...(input.enrolledAt !== undefined && { enrolledAt: input.enrolledAt }),
			...(input.expiresAt !== undefined && { expiresAt: input.expiresAt }),
			...(input.lastAccessAt !== undefined && {
				lastAccessAt: input.lastAccessAt,
			}),
			...(input.certificateIssued !== undefined && {
				certificateIssued: input.certificateIssued,
			}),
			...(input.certificateUrl !== undefined && {
				certificateUrl: input.certificateUrl,
			}),
			...(input.completedAt !== undefined && {
				completedAt: input.completedAt,
			}),
			updatedAt: new Date(),
		})
	}
}
