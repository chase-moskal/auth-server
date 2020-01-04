
import {OAuth2Client} from "google-auth-library"
import {signToken, verifyToken} from "authoritarian/dist-cjs/crypto"
import {
	User,
	AuthTokens,
	AccessToken,
	RefreshToken,
	AccessPayload,
	RefreshPayload,
	AuthExchangerTopic,
	ClaimsVanguardTopic,
	ProfileMagistrateTopic,
} from "authoritarian/dist-cjs/interfaces"

import {generateName} from "./modules/generate-name"
import {verifyGoogleIdToken} from "./modules/verify-google-id-token"

export const createAuthExchanger = ({
	publicKey,
	privateKey,
	oAuth2Client,
	claimsVanguard,
	googleClientId,
	profileMagistrate,
	accessTokenExpiresIn,
	refreshTokenExpiresIn,
}: {
	publicKey: string
	privateKey: string
	googleClientId: string
	oAuth2Client: OAuth2Client
	accessTokenExpiresIn: string
	refreshTokenExpiresIn: string
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

			const refreshToken = await signToken<RefreshPayload>({
				privateKey,
				payload: {userId},
				expiresIn: refreshTokenExpiresIn
			})

			const accessToken = await signToken<AccessPayload>({
				privateKey,
				payload: {user},
				expiresIn: accessTokenExpiresIn
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
		const data = await verifyToken<RefreshPayload>({token: refreshToken, publicKey})
		const {userId} = data.payload
		const user = await claimsVanguard.getUser({userId})
		const accessToken = await signToken<AccessPayload>({
			privateKey,
			payload: {user},
			expiresIn: accessTokenExpiresIn
		})
		return accessToken
	}
})
