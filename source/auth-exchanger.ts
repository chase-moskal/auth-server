
// TODO cjs
import * as _googleAuth from "google-auth-library"

import {tokenSign} from "redcrypto/dist/token-sign.js"
import {tokenVerify} from "redcrypto/dist/token-verify.js"
import {
	AuthTokens,
	AccessToken,
	RefreshToken,
	AccessPayload,
	RefreshPayload,
	ClaimsDealerTopic,
	AuthExchangerTopic,
	ClaimsVanguardTopic,
	ProfileMagistrateTopic,
} from "authoritarian/dist/interfaces.js"

import {generateName} from "./modules/generate-name.js"
import {verifyGoogleIdToken} from "./modules/verify-google-id-token.js"

export const createAuthExchanger = ({
	publicKey,
	privateKey,
	oAuth2Client,
	claimsDealer,
	claimsVanguard,
	googleClientId,
	profileMagistrate,
	accessTokenExpiresMilliseconds,
	refreshTokenExpiresMilliseconds,
}: {
	publicKey: string
	privateKey: string
	googleClientId: string
	oAuth2Client: _googleAuth.OAuth2Client
	accessTokenExpiresMilliseconds: number
	refreshTokenExpiresMilliseconds: number
	claimsDealer: ClaimsDealerTopic
	claimsVanguard: ClaimsVanguardTopic
	profileMagistrate: ProfileMagistrateTopic
}): AuthExchangerTopic => ({

	/**
	 * Authenticate with google
	 * - user trades their google token in exchange for our auth tokens
	 */
	async authenticateViaGoogle({googleToken}: {
		googleToken: string
	}): Promise<AuthTokens> {
		if (googleToken) {
			const {googleId, avatar} = await verifyGoogleIdToken({
				googleToken,
				oAuth2Client,
				googleClientId
			})

			console.log(" - googleId", googleId)

			const user = await claimsVanguard.createUser({googleId})
			const {userId} = user

			const refreshToken = await tokenSign<RefreshPayload>({
				privateKey,
				payload: {userId},
				expiresMilliseconds: refreshTokenExpiresMilliseconds
			})

			const accessToken = await tokenSign<AccessPayload>({
				privateKey,
				payload: {user},
				expiresMilliseconds: accessTokenExpiresMilliseconds
			})

			const profile = await profileMagistrate.getProfile({userId})

			if (!profile)
				await profileMagistrate.setProfile({
					accessToken,
					profile: {
						userId,
						avatar,
						nickname: generateName(),
					}
				})

			return {refreshToken, accessToken}
		}
		else {
			throw new Error(`unknown token`)
		}
	},

	/**
	 * Buy a new access token using a refresh token
	 */
	async authorize({refreshToken}: {refreshToken: RefreshToken}): Promise<AccessToken> {
		const data = await tokenVerify<RefreshPayload>({token: refreshToken, publicKey})
		const {userId} = data.payload
		const user = await claimsDealer.getUser({userId})
		const accessToken = await tokenSign<AccessPayload>({
			privateKey,
			payload: {user},
			expiresMilliseconds: accessTokenExpiresMilliseconds
		})
		return accessToken
	}
})
