
import {OAuth2Client} from "google-auth-library"
import {signToken, verifyToken} from "authoritarian/dist/cjs/crypto"
import {
	User,
	AuthTokens,
	AccessToken,
	RefreshToken,
	AccessPayload,
	ProfilerTopic,
	RefreshPayload,
	AuthExchangerTopic,
	ClaimsVanguardTopic,
} from "authoritarian/dist/cjs/interfaces"

import {verifyGoogleIdToken} from "./modules/verify-google-id-token"

export const createAuthExchanger = ({
	profiler,
	publicKey,
	privateKey,
	oAuth2Client,
	claimsVanguard,
	googleClientId,
	accessTokenExpiresIn,
	refreshTokenExpiresIn,
}: {
	publicKey: string
	privateKey: string
	googleClientId: string
	profiler: ProfilerTopic
	oAuth2Client: OAuth2Client
	accessTokenExpiresIn: string
	refreshTokenExpiresIn: string
	claimsVanguard: ClaimsVanguardTopic
}): AuthExchangerTopic => ({

	/**
	 * Authenticate with google
	 * - user trades their google token in exchange for our auth tokens
	 */
	async authenticateViaGoogle({googleToken}: {
		googleToken: string
	}): Promise<AuthTokens> {
		if (googleToken) {
			const {googleId, realname, picture} = await verifyGoogleIdToken({
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

			const profile = await profiler.getProfile({accessToken})

			if (!profile)
				await profiler.setProfile({
					accessToken,
					profile: {
						userId,
						picture,
						realname,
						nickname: "",
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
		const userId = await verifyToken<string>({token: refreshToken, publicKey})
		const user = await claimsVanguard.getUser({userId})
		const accessToken = await signToken<User>({
			privateKey,
			payload: user,
			expiresIn: accessTokenExpiresIn
		})
		return accessToken
	}
})
