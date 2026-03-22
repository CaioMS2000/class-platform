import { DomainError } from './domain-error'

export class CourseMissingThumbnailError extends DomainError {
	constructor() {
		super('This course is missing a thumbnail.')
	}
}
