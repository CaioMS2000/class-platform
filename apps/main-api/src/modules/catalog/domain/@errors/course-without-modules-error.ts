import { DomainError } from './domain-error'

export class CourseWithoutModulesError extends DomainError {
	constructor() {
		super('This course has no modules.')
	}
}
