
import {TokenTopic, AccessToken, AuthTokens} from "authoritarian"

export class TokenService implements TokenTopic {
	private _storage: Storage

	constructor(options: {storage: Storage}) {
		this._storage = options.storage
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
		return "a123"
	}
}
