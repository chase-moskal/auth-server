
import {Host as CrosscallHost} from "crosscall/dist/cjs/host"
import {AccountPopupTopic} from "authoritarian/dist/cjs/interfaces"
import {
	HostCallee,
	CalleeTopic,
	CalleeTopics,
} from "crosscall/dist/interfaces"

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

	new CrosscallHost({
		namespace: "authoritarian",
		callee: {
			topics: {accountPopup: <any>accountPopup},
			events: {}
		},
		permissions: [{
			origin: /^http:\/\/localhost:8080$/,
			allowedTopics: {
				accountPopup: ["login"]
			},
			allowedEvents: []
		}]
	})
}

window.loginScript = loginScript
