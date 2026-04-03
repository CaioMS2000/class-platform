import { CatalogModuleApplicationError } from './app-error'

export class CourseNotFoundError extends CatalogModuleApplicationError {
	constructor(public message: string = 'Course not found') {
		super(message)
		this.name = 'CourseNotFoundError'
	}
}

export class ModuleNotFoundError extends CatalogModuleApplicationError {
	constructor(public message: string = 'Module not found') {
		super(message)
		this.name = 'ModuleNotFoundError'
	}
}

export class LessonNotFoundError extends CatalogModuleApplicationError {
	constructor(public message: string = 'Lesson not found') {
		super(message)
		this.name = 'LessonNotFoundError'
	}
}

export class CategoryNotFoundError extends CatalogModuleApplicationError {
	constructor(public message: string = 'Category not found') {
		super(message)
		this.name = 'CategoryNotFoundError'
	}
}

export class NotCourseOwnerError extends CatalogModuleApplicationError {
	constructor(
		public message: string = 'Instructor is not the owner of this course'
	) {
		super(message)
		this.name = 'NotCourseOwnerError'
	}
}
