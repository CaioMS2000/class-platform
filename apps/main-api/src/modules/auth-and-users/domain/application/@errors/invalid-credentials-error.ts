import { UsersModuleApplicationError } from './app-error'

export class InvalidCredentialsError extends UsersModuleApplicationError {
	constructor() {
		super('Invalid credentials')
	}
}
