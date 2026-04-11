import {
	usePostApiV1AuthRegister,
	type PostApiV1AuthRegisterMutationBody,
	type postApiV1AuthRegisterResponse201,
	type postApiV1AuthRegisterResponseError,
} from '@/api/generated/auth/auth'
import type {
	UseMutationOptions,
	UseMutationResult,
} from '@tanstack/react-query'

type RegisterVariables = { data: PostApiV1AuthRegisterMutationBody }
type RegisterSuccess = postApiV1AuthRegisterResponse201
type RegisterError = postApiV1AuthRegisterResponseError
type Options = UseMutationOptions<
	RegisterSuccess,
	RegisterError,
	RegisterVariables
>
type Result = UseMutationResult<
	RegisterSuccess,
	RegisterError,
	RegisterVariables
>

export function useRegister(options?: Options): Result {
	return usePostApiV1AuthRegister({
		mutation: options as never,
	}) as never
}
