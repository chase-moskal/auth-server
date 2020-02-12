
import {setupPopupMessaging}
	from "authoritarian/dist-cjs/account-popup/setup-popup-messaging"

import {unpackRegex} from "./toolbox/unpack-regex"
import {prepareAuth} from "./services/prepare-auth"

import {AccountPopupSettings} from "./interfaces"

declare global {
	interface Window {
		start: () => Promise<void>
		settings: AccountPopupSettings
	}
}

// called by google library after it loads
window.start = async function start() {
	const {settings} = window
	const auth = prepareAuth(settings.googleAuthDetails)
	await setupPopupMessaging({
		auth,
		cors: {
			allowed: unpackRegex(settings.cors.allowed),
			forbidden: unpackRegex(settings.cors.forbidden),
		}
	})
}
