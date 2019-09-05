
import {GoogleAuthDetails, GoogleAuthFixed} from "../../interfaces"

/**
 * Initialize google auth
 */
export async function initGoogleAuth({clientId, redirectUri}: GoogleAuthDetails) {
	return new Promise<GoogleAuthFixed>((resolve, reject) => {
		gapi.load("auth2", () => {
			const googleAuth = gapi.auth2.init({
				ux_mode: "redirect",
				client_id: clientId,
				redirect_uri: redirectUri
			})
			googleAuth.then(
				() => resolve(fixGoogleAuth(googleAuth)),
				problem => reject(problem.error)
			)
		})
	})
}

/**
 * Eliminate google auth object's weird pseudo-promise funny-business
 */
export function fixGoogleAuth(googleAuth: gapi.auth2.GoogleAuth): GoogleAuthFixed {
	const fixedGoogleAuth = Object.create(googleAuth)
	fixedGoogleAuth.then = undefined
	return fixedGoogleAuth
}
