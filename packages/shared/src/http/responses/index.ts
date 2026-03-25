export const unauthorizedResponse = {
	401: { description: 'Unauthorized' },
}

export const notFoundResponse = (message = 'Not Found') => ({
	404: { description: message },
})

export const serverErrorResponse = {
	500: { description: 'Internal Server Error' },
}
