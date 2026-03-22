import { failure, type Result, success, ValueObject } from '@repo/core'
import { ProgressRangeError } from '../@errors/progress-range-error'

export class EnrollmentProgressValue extends ValueObject<number> {
	protected constructor(value: number) {
		super(value)
	}

	static create(
		value: number
	): Result<ProgressRangeError, EnrollmentProgressValue> {
		if (value < 0 || value > 100) {
			return failure(new ProgressRangeError())
		}

		return success(new EnrollmentProgressValue(value))
	}

	isCompleted(): boolean {
		return this.value === 100
	}
}
