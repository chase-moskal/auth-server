
import {LoginTopic, AccessToken} from "authoritarian"

import {GoogleAuthDetails} from "../interfaces"
import {initGoogleAuth} from "./login-tools/init-google-auth"
import {prepGoogleSignOutButton} from "./login-tools/prep-google-signout-button"

export class LoginService implements LoginTopic {
	private _googleAuthDetails: GoogleAuthDetails

	constructor(options: {googleAuthDetails: GoogleAuthDetails}) {
		this._googleAuthDetails = options.googleAuthDetails
	}

	async userLoginRoutine(): Promise<AccessToken> {

		// TODO wait until google platform loads

		const googleAuth = await initGoogleAuth(this._googleAuthDetails)

		prepGoogleSignOutButton({
			button: document.querySelector<HTMLDivElement>("#google-signout"),
			googleAuth
		})

		await this._auth()

		return "a123"
	}

	/**
	 * Authenticate with google
	 */
	private async _auth() {
		const googleUser = await this._renderGoogleSignInButton()
		const googleToken = googleUser.getAuthResponse().id_token
		console.log("googleToken", googleToken)

		// // call to /auth
		// const raw = await fetch("/auth", {
		// 	method: "POST",
		// 	headers: {
		// 		"Accept": "application/json",
		// 		"Content-Type": "application/json"
		// 	},
		// 	body: JSON.stringify({
		// 		method: "authenticateWithGoogle",
		// 		googleToken
		// 	})
		// })
		// const response = await raw.json()
		// console.log("/auth response:", response)
	}

	/**
	 * Render google sign-in button
	 */
	private async _renderGoogleSignInButton() {

		// TODO -- perhaps this shouldn't be a promise?
		// it's a coincidence this works as a promise, because the page is refreshed
		// after each login attempt, such that there is never more than one attempt.
		// it might be smarter to allow multiple logins attempts...
		return new Promise<gapi.auth2.GoogleUser>((resolve, reject) => {
			gapi.signin2.render("google-signin", {
				onsuccess: resolve,
				onfailure: reject
			})
		})
	}
}
