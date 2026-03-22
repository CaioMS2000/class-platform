export class CourseNotFoundError extends Error {
	constructor() {
		super('Course not found.')
	}
}

export class StudentNotFoundError extends Error {
	constructor() {
		super('Student not found.')
	}
}

export class EnrollmentNotFoundError extends Error {
	constructor() {
		super('Enrollment not found.')
	}
}
