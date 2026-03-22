import { DomainError } from './domain-error'

export class CourseWithoutClassesError extends DomainError {
	constructor() {
		super('This course has no classes.')
	}
}
