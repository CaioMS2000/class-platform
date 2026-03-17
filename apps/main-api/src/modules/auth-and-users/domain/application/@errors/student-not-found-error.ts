import { UsersModuleApplicationError } from './app-error'

export class StudentNotFoundError extends UsersModuleApplicationError {
	constructor() {
		super('Student not found')
	}
}
