export class AdminNotFoundError extends Error {
	constructor(public message: string = 'Admin not found') {
		super(message)
		this.name = 'AdminNotFoundError'
	}
}

export class InstructorNotFoundError extends Error {
	constructor(public message: string = 'Instructor not found') {
		super(message)
		this.name = 'InstructorNotFoundError'
	}
}

export class StudentNotFoundError extends Error {
	constructor(public message: string = 'Student not found') {
		super(message)
		this.name = 'StudentNotFoundError'
	}
}
