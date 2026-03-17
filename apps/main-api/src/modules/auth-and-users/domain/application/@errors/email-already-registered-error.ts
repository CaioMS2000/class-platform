import { UsersModuleApplicationError } from './app-error'

export class EmailAlreadyRegisteredError extends UsersModuleApplicationError {
	constructor() {
		super('Email already registered')
	}
}
