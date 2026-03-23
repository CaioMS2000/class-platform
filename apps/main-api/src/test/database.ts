import { drizzle } from '@/lib/drizzle'
import {
	admins,
	instructors,
	oauthAccounts,
	oauthStates,
	refreshTokens,
	students,
} from '@/modules/auth-and-users/infrastructure/database/schema'
import {
	categories,
	courseModules,
	courses,
	lessons,
} from '@/modules/catalog/infrastructure/database/schema'
import {
	enrollments,
	lessonProgress,
} from '@/modules/learning/infrastructure/database/schema'

export async function cleanAllTables() {
	await drizzle.delete(lessonProgress)
	await drizzle.delete(enrollments)
	await drizzle.delete(lessons)
	await drizzle.delete(courseModules)
	await drizzle.delete(courses)
	await drizzle.delete(categories)
	await drizzle.delete(refreshTokens)
	await drizzle.delete(oauthAccounts)
	await drizzle.delete(oauthStates)
	await drizzle.delete(admins)
	await drizzle.delete(students)
	await drizzle.delete(instructors)
}
