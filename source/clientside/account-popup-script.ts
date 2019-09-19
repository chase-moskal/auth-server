
import {AccountPopupConfig} from "./interfaces"
import {GoogleAuthClient} from "./services/google-auth-client"
import {createAuthExchangerClient} from "./services/create-auth-exchanger-client"

declare global {
	interface Window {
		config: AccountPopupConfig
		accountPopupScript: typeof accountPopupScript
	}
}

const namespace = "authoritarian-account-popup"

async function accountPopupScript() {
	const [regexBody, regexFlags] = window.config.allowedOriginsRegex
	const allowedOriginsRegex = new RegExp(regexBody, regexFlags)
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
				namespace: "authoritarian-account-popup",
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
	const {googleAuthDetails} = window.config
	const googleAuthClient = new GoogleAuthClient(googleAuthDetails)
	const authExchanger = await createAuthExchangerClient({
		url: `${location.origin}/auth-exchanger`
	})

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

window.accountPopupScript = accountPopupScript
