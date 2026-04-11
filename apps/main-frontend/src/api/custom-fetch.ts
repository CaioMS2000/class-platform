import { env } from '@/config/env'

export class ApiError<
	TData = unknown,
	TStatus extends number = number,
> extends Error {
	constructor(
		public status: TStatus,
		public data: TData,
		public headers: Headers
	) {
		super(`API Error: ${status}`)
		this.name = 'ApiError'
	}
}

export const customFetch = async <T>(
	url: string,
	options?: RequestInit
): Promise<T> => {
	const isFormData = options?.body instanceof FormData
	const response = await fetch(`${env.VITE_API_URL}${url}`, {
		...options,
		headers: {
			...(!isFormData && { 'Content-Type': 'application/json' }),
			...options?.headers,
		},
	})

	const body = [204, 205, 304].includes(response.status)
		? null
		: await response.text()
	const data = body ? JSON.parse(body) : {}

	if (!response.ok) {
		throw new ApiError(response.status, data, response.headers)
	}

	return { data, status: response.status, headers: response.headers } as T
}
