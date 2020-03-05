
import {GoogleAuthDetails} from "../interfaces.js"
import {GoogleAuthClient} from "./google-auth-client.js"
import {createAuthExchangerClient} from "./create-auth-client.js"

export function prepareAuth(googleAuthDetails: GoogleAuthDetails) {
	return async function auth() {
		const googleAuthClient = new GoogleAuthClient(googleAuthDetails)
		const {authExchanger} = await createAuthExchangerClient({
			url: `${location.origin}/api`
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
}
