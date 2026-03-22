import { failure, success, type Result } from '@repo/core'
import type { Course } from '../entities/course'
import type { Module } from '../entities/module'
import { CourseWithoutModulesError } from '../@errors/course-without-modules-error'
import { ModuleWithoutLessonsError } from '../@errors/module-without-lessons-error'
import { CourseMissingThumbnailError } from '../@errors/course-missing-thumbnail-error'

export class CoursePublicationService {
	publish(
		course: Course,
		modules: Module[]
	): Result<
		| CourseMissingThumbnailError
		| CourseWithoutModulesError
		| ModuleWithoutLessonsError,
		Course
	> {
		if (!course.thumbnail) return failure(new CourseMissingThumbnailError())
		if (modules.length < 1) return failure(new CourseWithoutModulesError())
		if (modules.some(m => m.lessonsIds.length < 1))
			return failure(new ModuleWithoutLessonsError())
		return success(course.publish())
	}
}
