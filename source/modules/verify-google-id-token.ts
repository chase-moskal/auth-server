
import {OAuth2Client} from "google-auth-library"

export async function verifyGoogleIdToken({
	googleToken,
	oAuth2Client,
	googleClientId
}: {
	googleToken: string
	googleClientId: string
	oAuth2Client: OAuth2Client
}): Promise<string> {

	const ticket = await oAuth2Client.verifyIdToken({
		idToken: googleToken,
		audience: googleClientId
	})

	const payload = ticket.getPayload()
	const googleUserId = payload.sub

	return googleUserId
}
