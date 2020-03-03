
import {unpackCorsConfig}
	from "authoritarian/dist/toolbox/unpack-cors-config.js"
import {setupPopupMessaging}
	from "authoritarian/dist/account-popup/setup-popup-messaging.js"

import {prepareAuth} from "./services/prepare-auth.js"
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
	await setupPopupMessaging({
		auth,
		cors: unpackCorsConfig(settings.cors)
	})
}

if (window.startReady) window.start()
