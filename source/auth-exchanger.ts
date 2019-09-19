
import {OAuth2Client} from "google-auth-library"
import {
	AuthTokens,
	AccessToken,
	RefreshToken,
	AuthExchangerTopic,
} from "authoritarian/dist/cjs/interfaces"

import {verifyGoogleIdToken} from "./modules/verify-google-id-token"

export const createAuthExchanger = ({googleClientId, oAuth2Client}: {
	googleClientId: string
	oAuth2Client: OAuth2Client
}): AuthExchangerTopic => ({

	/**
	 * Authenticate with google
	 * - user trades their google token in exchange for our auth tokens
	 */
	async authenticateViaGoogle({googleToken}: {
		googleToken: string
	}): Promise<AuthTokens> {

		if (googleToken) {
			const googleUserId = await verifyGoogleIdToken({
				googleToken,
				oAuth2Client,
				googleClientId
			})
			console.log(" - googleUserId", googleUserId)
		}
		else {
			throw new Error(`unknown token`)
		}

		// generate authoritarian tokens

		return {refreshToken: "r123", accessToken: "a123"}
	},

	/**
	 * Buy a new access token using a refresh token
	 */
	async authorize(options: {refreshToken: RefreshToken}): Promise<AccessToken> {
		return "a123"
	}
})
