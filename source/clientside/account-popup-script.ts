
import {accountPopupHost}
	from "authoritarian/dist-cjs/account-popup/account-popup-host"

import {prepareAuth} from "./services/prepare-auth"
import {AccountPopupSettings, JsonRegex} from "./interfaces"

declare global {
	interface Window {
		start: () => Promise<void>
		settings: AccountPopupSettings
	}
}

export const regex = (json: JsonRegex) => json
	? new RegExp(json.pattern, json.flags)
	: null

// called by google library after it loads
window.start = async function start() {
	const {settings} = window
	const auth = prepareAuth(settings.googleAuthDetails)
	accountPopupHost({
		auth,
		cors: {
			allowed: regex(settings.cors.allowed),
			forbidden: regex(settings.cors.forbidden),
		}
	})
}
