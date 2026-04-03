import { InvalidValueError } from '@repo/core'
import { status } from 'elysia'
import {
	CategoryNotFoundError,
	CourseNotFoundError,
	LessonNotFoundError,
	ModuleNotFoundError,
	NotCourseOwnerError,
} from '@/modules/catalog/application/@errors'

type Constructor<T> = new (...args: never[]) => T

type ErrorEntry = {
	type: Constructor<Error>
	code: number
}

const errorMap: ErrorEntry[] = [
	{ type: CategoryNotFoundError, code: 404 },
	{ type: CourseNotFoundError, code: 404 },
	{ type: ModuleNotFoundError, code: 404 },
	{ type: LessonNotFoundError, code: 404 },
	{ type: NotCourseOwnerError, code: 403 },
	{ type: InvalidValueError, code: 422 },
]

export function mapErrorToHttp(error: Error) {
	const entry = errorMap.find(e => error instanceof e.type)
	const code = entry?.code ?? 500
	return status(code, { error: error.message })
}
