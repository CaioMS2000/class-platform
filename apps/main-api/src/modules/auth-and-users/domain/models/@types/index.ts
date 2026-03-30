export const Role = ['STUDENT', 'INSTRUCTOR', 'ADMIN'] as const
export type Role = (typeof Role)[number]

export const InstructorStatus = ['active', 'blocked', 'pending'] as const
export type InstructorStatus = (typeof InstructorStatus)[number]

export const StudentStatus = ['active', 'blocked', 'pending'] as const
export type StudentStatus = (typeof StudentStatus)[number]

export const AdminStatus = ['active', 'blocked', 'pending'] as const
export type AdminStatus = (typeof AdminStatus)[number]
