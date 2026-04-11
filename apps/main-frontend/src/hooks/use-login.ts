import {
	usePostApiV1AuthLogin,
	type PostApiV1AuthLoginMutationBody,
	type postApiV1AuthLoginResponse200,
	type postApiV1AuthLoginResponseError,
} from '@/api/generated/auth/auth'
import type {
	UseMutationOptions,
	UseMutationResult,
} from '@tanstack/react-query'

type LoginVariables = { data: PostApiV1AuthLoginMutationBody }
type LoginSuccess = postApiV1AuthLoginResponse200
type LoginError = postApiV1AuthLoginResponseError
type Options = UseMutationOptions<LoginSuccess, LoginError, LoginVariables>
type Result = UseMutationResult<LoginSuccess, LoginError, LoginVariables>

export function useLogin(options?: Options): Result {
	return usePostApiV1AuthLogin({
		mutation: options as never,
	}) as never
}
