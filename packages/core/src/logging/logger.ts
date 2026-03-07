export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type BaseFields = Record<string, unknown>

export type Logger = {
	child(extra: BaseFields): Logger
	debug(msg: string, extra?: BaseFields): void
	info(msg: string, extra?: BaseFields): void
	warn(msg: string, extra?: BaseFields): void
	error(msg: string, extra?: BaseFields & { err?: unknown }): void
}

export type CreateLoggerFn = (base?: BaseFields) => Logger
