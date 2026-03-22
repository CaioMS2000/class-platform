export const EnrollmentStatus = [
	'active',
	'completed',
	'canceled',
	'expired',
] as const
export type EnrollmentStatus = (typeof EnrollmentStatus)[number]

export const ProgressStatus = [
	'not_started',
	'in_progress',
	'completed',
] as const
export type ProgressStatus = (typeof ProgressStatus)[number]
