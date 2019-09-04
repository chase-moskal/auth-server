
import {TokenTopic, AccessToken, AuthTokens, AuthTopic} from "authoritarian"

export class TokenService implements TokenTopic {
	private _storage: Storage
	private _authService: AuthTopic

	constructor(options: {
		storage: Storage
		authService: AuthTopic
	}) {
		this._storage = options.storage
		this._authService = options.authService
	}

	async writeTokens({accessToken, refreshToken}: AuthTokens): Promise<void> {
		this._storage.setItem("accessToken", accessToken)
		this._storage.setItem("refreshToken", refreshToken)
	}

	async logout(): Promise<void> {
		this._storage.removeItem("accessToken")
		this._storage.removeItem("refreshToken")
	}

	async passiveCheck(): Promise<AccessToken> {
		return null
	}
}
