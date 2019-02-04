
import {Details} from "./interfaces"
import {initGoogleAuth} from "./modules/login-api/init-google-auth"
import {prepGoogleSignOutButton} from "./modules/login-api/prep-google-signout-button"

declare global {
	interface Window {
		details: Details
		loginScript: typeof loginScript
	}
}

window.loginScript = loginScript

/**
 * Kick-off google auth routine
 * - is run after the google platform loads
 */
async function loginScript() {
	const googleAuth = await initGoogleAuth(window.details)
	prepGoogleSignOutButton({
		button: document.querySelector<HTMLDivElement>("#google-signout"),
		googleAuth
	})
	await auth()
}

/**
 * Authenticate with google
 */
async function auth() {
	const googleUser = await renderGoogleSignInButton()
	const googleToken = googleUser.getAuthResponse().id_token
	console.log("googleToken", googleToken)

	// call to /auth
	const raw = await fetch("/auth", {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			method: "authenticateWithGoogle",
			googleToken
		})
	})
	const response = await raw.json()
	console.log("/auth response:", response)
}

/**
 * Render google sign-in button
 */
async function renderGoogleSignInButton() {

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
