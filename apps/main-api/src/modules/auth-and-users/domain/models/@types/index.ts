export type { Role } from '@repo/shared/types/role'

export const InstructorStatus = ['active', 'blocked', 'pending'] as const
export type InstructorStatus = (typeof InstructorStatus)[number]

export const StudentStatus = ['active', 'blocked', 'pending'] as const
export type StudentStatus = (typeof StudentStatus)[number]

export const AdminStatus = ['active', 'blocked', 'pending'] as const
export type AdminStatus = (typeof AdminStatus)[number]
