import { env } from '@/config/env'

export const customFetch = async <T>(
	url: string,
	options?: RequestInit
): Promise<T> => {
	const response = await fetch(`${env.VITE_API_URL}${url}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options?.headers,
		},
	})

	const body = [204, 205, 304].includes(response.status)
		? null
		: await response.text()
	const data = body ? JSON.parse(body) : {}

	return { data, status: response.status, headers: response.headers } as T
}
