export type Category = {
	id: string
	name: string
	slug: string
	description?: string
	icon?: string
} & { readonly __brand: 'Category' }
