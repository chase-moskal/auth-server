
import {Details} from "./interfaces"
import {initGoogleAuth} from "./modules/init-google-auth"
import {prepGoogleSignOutButton} from "./modules/prep-google-signout-button"

declare global {
	interface Window {
		details: Details
		loginScript: typeof loginScript
	}
}

window.loginScript = loginScript

/**
 * Kick-off google auth routine
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
	const token = googleUser.getAuthResponse().id_token
	console.log("token", token)

	// call to /auth/n
	const raw = await fetch("/auth/n", {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({token})
	})
	const response = await raw.json()
	console.log("/auth/n response:", response)
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
