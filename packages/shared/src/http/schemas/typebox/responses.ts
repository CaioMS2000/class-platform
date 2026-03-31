import { Type } from '@sinclair/typebox'

export const insufficientPermissionsResponse = {
	403: Type.Object({ error: Type.String() }),
}

export const notFoundResponse = {
	404: Type.Object({ error: Type.String() }),
}

export const serverErrorResponse = {
	500: Type.Object({ error: Type.String() }),
}
