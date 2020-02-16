
import {apiClient} from "renraku/dist/api-client.js"
import {authShape} from "authoritarian/dist/shapes.js"
import {AuthApi} from "authoritarian/dist/interfaces.js"
import {crosscallHost} from "crosscall/dist/crosscall-host.js"

import {TokenStorage} from "./services/token-storage.js"

main()
	.then(() => console.log("🎟️ token script"))
	.catch(error => console.error(error))

async function main() {
	const {authExchanger} = await apiClient<AuthApi>({
		url: `${window.location.origin}/api`,
		shape: authShape
	})
	crosscallHost<any>({
		namespace: "authoritarian-token-storage",
		exposures: {
			tokenStorage: {
				exposed: new TokenStorage({
					authExchanger,
					storage: window.localStorage
				}),
				cors: {
					allowed: /^https?:\/\/localhost:8\d{3}$/i,
					forbidden: null
				}
			}
		}
	})
}
