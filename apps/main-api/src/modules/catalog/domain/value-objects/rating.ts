import { failure, success, ValueObject, type Result } from '@repo/core'
import { RatingValueRangeRule } from '../rules/rating-value-range-rule'
import { RatingValueOutsideRangeError } from '../@errors/rating-outside-range-error'

export class Rating extends ValueObject<number> {
	static create(value: number): Result<RatingValueOutsideRangeError, Rating> {
		const ratingRangeRule = new RatingValueRangeRule()

		if (!ratingRangeRule.validate(value)) {
			return failure(new RatingValueOutsideRangeError())
		}

		return success(new Rating(value))
	}

	static zero(): Rating {
		return new Rating(0)
	}
}
