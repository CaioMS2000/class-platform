import { DomainError } from './domain-error'

export class RatingValueOutsideRangeError extends DomainError {
	constructor() {
		super('Rating must be between 0 and 5')
	}
}
