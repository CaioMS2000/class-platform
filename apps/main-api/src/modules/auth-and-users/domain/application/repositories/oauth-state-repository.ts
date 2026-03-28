export type OAuthStateData = {
	codeVerifier: string
	provider: string
	role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
}

export abstract class OAuthStateRepository {
	abstract save(
		state: string,
		data: OAuthStateData,
		expiresInSeconds: number
	): Promise<void>

	abstract findAndDelete(state: string): Promise<OAuthStateData | null>
}
