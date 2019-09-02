
import {TokenTopic, AccessToken} from "authoritarian"

export const createTokenApi = (): TokenTopic => ({

	async obtainAccessToken(): Promise<AccessToken> {
		return "a123"
	},

	async clearTokens(): Promise<void> {}
})
