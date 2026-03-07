import { failure, success, type Result } from '../../result'
import { ValueObject } from '../../value-object'
import { InvalidValueError } from '../@errors'
import type { Currency } from '../@types/currency'
import { MinMoneyAmountRule } from './rules/no-negative-money-amount'

export type MoneyProps = {
	valueInCents: number
	currency: Currency
}

export class Money extends ValueObject<MoneyProps> {
	private constructor(value: MoneyProps) {
		super(value)
	}

	static create(
		valueInCents: number,
		currency: Currency
	): Result<InvalidValueError, Money> {
		const moneyAmountRule = new MinMoneyAmountRule()
		if (!moneyAmountRule.validate(valueInCents)) {
			return failure(new InvalidValueError(moneyAmountRule.message))
		}

		return success(new Money({ valueInCents, currency }))
	}

	get valueInCents(): number {
		return this.value.valueInCents
	}

	get currency(): Currency {
		return this.value.currency
	}
}
