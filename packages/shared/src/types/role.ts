export const Role = ['STUDENT', 'INSTRUCTOR', 'ADMIN'] as const
export type Role = (typeof Role)[number]
