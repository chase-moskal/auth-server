
// import {Host as CrosscallHost} from "crosscall"

import {GoogleAuthDetails} from "./interfaces"
import {AccountPopup} from "./services/account-popup"
import {TokenStorage} from "./services/token-storage"
import {AuthExchanger} from "./services/auth-exchanger"
import {GoogleAuthClient} from "./services/google-auth-client"

declare global {
	interface Window {
		googleAuthDetails: GoogleAuthDetails
		loginScript: typeof loginScript
	}
}

async function loginScript() {
	const {googleAuthDetails} = window
	const googleAuthClient = new GoogleAuthClient(googleAuthDetails)
	const authExchanger = new AuthExchanger()
	const tokenStorage = new TokenStorage({
		authExchanger,
		storage: window.sessionStorage
	})
	const accountPopup = new AccountPopup({
		googleAuthClient,
		authExchanger,
		tokenStorage
	})
	const token = await accountPopup.login()
	console.log("USER LOGIN ROUTINE COMPLETE", token)
}

window.loginScript = loginScript

// const host = new CrosscallHost({
// 	callee: {
// 		topics: {
// 			AccountPopup: <any>AccountPopup
// 		},
// 		events: {}
// 	},
// 	permissions: [{
// 		origin: /^http:\/\/localhost:8080$/,
// 		allowedTopics: {
// 			exampleTopic: ["AccountPopup"]
// 		},
// 		allowedEvents: []
// 	}]
// })
