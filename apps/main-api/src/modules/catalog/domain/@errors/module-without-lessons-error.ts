import { DomainError } from './domain-error'

export class ModuleWithoutLessonsError extends DomainError {
	constructor() {
		super('All modules must have at least one lesson.')
	}
}
