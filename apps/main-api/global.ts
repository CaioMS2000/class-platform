import type {
	Optional as _Optional,
	DistributiveOmit as _DistributiveOmit,
	DeepPartial as _DeepPartial,
} from '@repo/core'
import { type Type as _Type } from './type'

declare global {
	type Optional<T, K extends keyof T> = _Optional<T, K>
	type DistributiveOmit<T, K extends PropertyKey> = _DistributiveOmit<T, K>
	type DeepPartial<T> = _DeepPartial<T>
	type Type<T> = _Type<T>
}
/*
Object.assign(globalThis, {
	ApplicationContext: _ApplicationContext,
})*/
