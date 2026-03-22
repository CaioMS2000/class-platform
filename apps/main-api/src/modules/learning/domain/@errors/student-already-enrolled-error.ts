import { DomainError } from './domain-error'

export class StudentAlreadyEnrolledError extends DomainError {
	constructor() {
		super('Student already enrolled in this course.')
	}
}
