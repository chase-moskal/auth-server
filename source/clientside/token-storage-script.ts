
import {apiClient} from "renraku/dist/api-client.js"
import {authShape} from "authoritarian/dist/shapes.js"
import {AuthApi} from "authoritarian/dist/interfaces.js"
import {crosscallHost} from "crosscall/dist/crosscall-host.js"
import {unpackCorsConfig}
	from "authoritarian/dist/toolbox/unpack-cors-config.js"

import {TokenStorageConfig} from "./interfaces.js"

import {TokenStorage} from "./services/token-storage.js"

main()
	.then(() => console.log("🎟️ token script"))
	.catch(error => console.error(error))

async function main() {
	const {authExchanger} = await apiClient<AuthApi>({
		url: `${window.location.origin}/api`,
		shape: authShape
	})
	const settings: TokenStorageConfig = window.settings
	crosscallHost<any>({
		namespace: "authoritarian-token-storage",
		exposures: {
			tokenStorage: {
				exposed: new TokenStorage({
					authExchanger,
					storage: window.localStorage
				}),
				cors: unpackCorsConfig(settings.cors)
			}
		}
	})
}
