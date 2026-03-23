export function makeOAuthStateData(
	overrides: Partial<{
		state: string
		codeVerifier: string
		provider: string
		expiresInSeconds: number
	}> = {}
) {
	return {
		state: overrides.state ?? `state-${crypto.randomUUID()}`,
		data: {
			codeVerifier: overrides.codeVerifier ?? `verifier-${crypto.randomUUID()}`,
			provider: overrides.provider ?? 'google',
		},
		expiresInSeconds: overrides.expiresInSeconds ?? 600,
	}
}
