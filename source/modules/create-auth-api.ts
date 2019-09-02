
import {OAuth2Client} from "google-auth-library"
import {AuthTopic, RefreshToken, AuthTokens, AccessToken} from "authoritarian"

import {verifyGoogleIdToken} from "./verify-google-id-token"

export const createAuthApi = ({googleClientId, oAuth2Client}: {
	googleClientId: string
	oAuth2Client: OAuth2Client
}): AuthTopic => ({

	/**
	 * Authenticate with google
	 * - user trades their google token in exchange for our auth tokens
	 */
	async authenticateWithGoogle({googleToken}: {
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

		return {refreshToken: "r123", accessToken: "a123"}
	},

	/**
	 * Buy a new access token using a refresh token
	 */
	async authorize(options: {refreshToken: RefreshToken}): Promise<AccessToken> {
		return "a123"
	}
})
