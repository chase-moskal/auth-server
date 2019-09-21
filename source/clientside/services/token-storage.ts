
import {
	AuthTokens,
	AccessToken,
	TokenStorageTopic,
	AuthExchangerTopic,
} from "authoritarian/dist/interfaces"

export class TokenStorage implements TokenStorageTopic {
	private _storage: Storage
	private _authExchanger: AuthExchangerTopic

	constructor(options: {
		storage: Storage
		authExchanger: AuthExchangerTopic
	}) {
		this._storage = options.storage
		this._authExchanger = options.authExchanger
	}

	async writeTokens({accessToken, refreshToken}: AuthTokens): Promise<void> {
		this._storage.setItem("accessToken", accessToken)
		this._storage.setItem("refreshToken", refreshToken)
	}

	async clearTokens(): Promise<void> {
		this._storage.removeItem("accessToken")
		this._storage.removeItem("refreshToken")
	}

	async passiveCheck(): Promise<AccessToken> {
		let accessToken = this._storage.getItem("accessToken")
		let refreshToken = this._storage.getItem("refreshToken")

		if (!accessToken) {
			if (refreshToken) {
				accessToken = await this._authExchanger.authorize({refreshToken})
			}
			else {
				accessToken = null
			}
		}

		await this.writeTokens({accessToken, refreshToken})

		return accessToken
	}
}
