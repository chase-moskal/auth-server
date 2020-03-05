
import {tokenSign} from "redcrypto/dist/token-sign.js"
import {tokenVerify} from "redcrypto/dist/token-verify.js"
import {OAuth2Client} from "../commonjs/google-auth-library.js"
import {
	AuthTokens,
	AccessToken,
	RefreshToken,
	AccessPayload,
	RefreshPayload,
	AuthExchangerTopic,
	ProfileMagistrateTopic,
} from "authoritarian/dist/interfaces.js"

import {UsersDatabase} from "../interfaces.js"
import {generateName} from "../toolbox/generate-name.js"
import {verifyGoogleIdToken} from "../toolbox/verify-google-id-token.js"

export const createAuthExchanger = ({
	publicKey,
	privateKey,
	oAuth2Client,
	usersDatabase,
	googleClientId,
	profileMagistrate,
	accessTokenExpiresMilliseconds,
	refreshTokenExpiresMilliseconds,
}: {
	publicKey: string
	privateKey: string
	googleClientId: string
	oAuth2Client: OAuth2Client
	usersDatabase: UsersDatabase
	accessTokenExpiresMilliseconds: number
	refreshTokenExpiresMilliseconds: number
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

			const user = await usersDatabase.createUser({googleId})
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

			try {
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
			}
			catch (error) {
				throw new Error(`communications with profile magistrate `
					+ `failed: ${error.message}`)
			}

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
		const user = await usersDatabase.getUser({userId})
		const accessToken = await tokenSign<AccessPayload>({
			privateKey,
			payload: {user},
			expiresMilliseconds: accessTokenExpiresMilliseconds
		})
		return accessToken
	}
})
