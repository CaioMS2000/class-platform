import { Type } from '@sinclair/typebox'

export const unauthorizedResponse = {
	401: Type.Object({ error: Type.String() }),
}

export const notFoundResponse = {
	404: Type.Object({ error: Type.String() }),
}

export const serverErrorResponse = {
	500: Type.Object({ error: Type.String() }),
}
