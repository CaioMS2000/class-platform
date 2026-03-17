import { UsersModuleApplicationError } from './app-error'

export class AdminNotFoundError extends UsersModuleApplicationError {
	constructor() {
		super('Admin not found')
	}
}
