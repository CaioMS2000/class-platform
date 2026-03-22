export const EnrollmentStatus = [
	'active',
	'completed',
	'canceled',
	'expired',
] as const
export type EnrollmentStatus = (typeof EnrollmentStatus)[number]
