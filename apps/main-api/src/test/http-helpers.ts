import type { Elysia } from 'elysia'

type AnyElysia = Elysia<any, any, any, any, any, any, any>

export const req = (app: AnyElysia, path: string, options?: RequestInit) =>
	app.handle(new Request(`http://localhost${path}`, options))

export const jsonReq = (
	app: AnyElysia,
	method: string,
	path: string,
	body: unknown,
	extraHeaders?: Record<string, string>
) =>
	req(app, path, {
		method,
		headers: { 'Content-Type': 'application/json', ...extraHeaders },
		body: JSON.stringify(body),
	})
