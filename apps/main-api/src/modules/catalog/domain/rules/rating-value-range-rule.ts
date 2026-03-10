import { Rule } from '@repo/core'

export class RatingValueRangeRule extends Rule<number> {
	message = 'Rating must be between 0 and 5'

	validate(value: number): boolean {
		return value >= 0 && value <= 5
	}
}
