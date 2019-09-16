
import {GoogleAuthDetails} from "./interfaces"
import {AuthExchanger} from "./services/auth-exchanger"
import {GoogleAuthClient} from "./services/google-auth-client"

declare global {
	interface Window {
		googleAuthDetails: GoogleAuthDetails
		loginScript: typeof loginScript
	}
}

const namespace = "authoritarian-login"

async function loginScript() {
	const allowedOriginsRegex = /^http:\/\/localhost:8080$/i
	const opener: Window = window.opener

	window.addEventListener("message", async event => {
		const allowedOrigin = allowedOriginsRegex.test(event.origin)
		const isHandshake = typeof event.data === "object"
			&& event.data.namespace === namespace
			&& event.data.handshake === true
		if (allowedOrigin && isHandshake) {

			// get those sweet sweet tokens
			const tokens = await auth()
			opener.postMessage({
				namespace: "authoritarian-login",
				tokens
			}, event.origin)

		}
		else {
			console.error(`denied message from origin "${event.origin}"`)
		}
	})

	opener.postMessage({namespace, handshake: true}, "*")
}

async function auth() {
	const {googleAuthDetails} = window
	const googleAuthClient = new GoogleAuthClient(googleAuthDetails)
	const authExchanger = new AuthExchanger()

	await googleAuthClient.initGoogleAuth()

	googleAuthClient.prepareGoogleSignOutButton({
		button: document.querySelector<HTMLDivElement>("#google-signout")
	})

	const googleUser = await googleAuthClient.prepareGoogleSignInButton()
	const googleToken = googleUser.getAuthResponse().id_token
	console.log("googleToken", googleToken)

	const tokens = await authExchanger.authenticateViaGoogle({googleToken})
	console.log("USER LOGIN ROUTINE COMPLETE", tokens)

	return tokens
}

window.loginScript = loginScript
