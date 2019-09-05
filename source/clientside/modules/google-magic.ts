
import {GoogleAuthDetails, GoogleAuthFixed} from "../interfaces"

export class GoogleMagic {
	private _googleAuthDetails: GoogleAuthDetails

	constructor(googleAuthDetails: GoogleAuthDetails) {
		this._googleAuthDetails = googleAuthDetails
	}

	async initGoogleAuth(): Promise<GoogleAuthFixed> {
		const {clientId, redirectUri} = this._googleAuthDetails
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

	prepareGoogleSignOutButton({button, googleAuth}: {
		button: HTMLElement
		googleAuth: GoogleAuthFixed
	}) {
		const updateLogoutButton = (isSignedIn: boolean) =>
		button.style.display = isSignedIn
			? "block"
			: "none"
		updateLogoutButton(googleAuth.isSignedIn.get())
		googleAuth.isSignedIn.listen(updateLogoutButton)
		button.onclick = () => googleAuth.signOut()
	}
}

/**
 * Eliminate google auth object's weird pseudo-promise funny-business
 */
export function fixGoogleAuth(googleAuth: gapi.auth2.GoogleAuth): GoogleAuthFixed {
	const fixedGoogleAuth = Object.create(googleAuth)
	fixedGoogleAuth.then = undefined
	return fixedGoogleAuth
}
