import { UsersModuleApplicationError } from './app-error'

export class InstructorNotFoundError extends UsersModuleApplicationError {
	constructor() {
		super('Instructor not found')
	}
}
