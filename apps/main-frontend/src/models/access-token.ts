export type AccessToken = string & { readonly __brand: 'AccessToken' }
export const AccessToken = (id: string) => id as AccessToken
