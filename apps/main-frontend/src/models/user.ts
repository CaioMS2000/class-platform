export const UserRole = ['ADMIN', 'INSTRUCTOR', 'STUDENT'] as const
export type UserRole = (typeof UserRole)[number]
export type User = { id: string; name: string; email: string; role: UserRole }
