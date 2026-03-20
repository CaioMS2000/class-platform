export class CourseNotFoundError extends Error {
	constructor(public message: string = 'Course not found') {
		super(message)
		this.name = 'CourseNotFoundError'
	}
}

export class ModuleNotFoundError extends Error {
	constructor(public message: string = 'Module not found') {
		super(message)
		this.name = 'ModuleNotFoundError'
	}
}

export class LessonNotFoundError extends Error {
	constructor(public message: string = 'Lesson not found') {
		super(message)
		this.name = 'LessonNotFoundError'
	}
}

export class CategoryNotFoundError extends Error {
	constructor(public message: string = 'Category not found') {
		super(message)
		this.name = 'CategoryNotFoundError'
	}
}

export class NotCourseOwnerError extends Error {
	constructor(
		public message: string = 'Instructor is not the owner of this course'
	) {
		super(message)
		this.name = 'NotCourseOwnerError'
	}
}
