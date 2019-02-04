
import {TokenApi, AccessToken} from "authoritarian"

export const createTokenApi = (): TokenApi => ({

	async obtainAccessToken(): Promise<AccessToken> {
		return "a123"
	},

	async clearTokens(): Promise<void> {}
})
