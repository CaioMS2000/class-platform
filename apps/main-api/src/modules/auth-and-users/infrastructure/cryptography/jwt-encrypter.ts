import { Encrypter } from '../../domain/application/cryptography/encrypter'
import { JwtService } from '../../domain/application/jwt'

export class JwtEncrypter implements Encrypter {
	constructor(private jwtService: JwtService) {}

	encrypt(payload: Record<string, unknown>): Promise<string> {
		return this.jwtService.sign(payload)
	}
}
