
import {unpackCorsConfig} from "authoritarian/dist/toolbox/unpack-cors-config.js"
import {setupAccountPopup} from "authoritarian/dist/business/account-popup/setup-account-popup.js"

import {prepareAuth} from "./auth/prepare-auth.js"
import {AccountPopupSettings} from "./interfaces.js"

declare global {
	interface Window {
		startReady: boolean
		start: () => Promise<void>
		settings: AccountPopupSettings
	}
}

window.start = async function start() {
	const {settings} = window
	const auth = prepareAuth(settings.googleAuthDetails)
	setupAccountPopup({
		auth,
		cors: unpackCorsConfig(settings.cors)
	})
}

if (window.startReady) window.start()
