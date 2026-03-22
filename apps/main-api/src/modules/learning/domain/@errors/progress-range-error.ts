import { DomainError } from './domain-error'

export class ProgressRangeError extends DomainError {
	constructor() {
		super('Progress must be between 0 and 100 in percentage.')
	}
}
