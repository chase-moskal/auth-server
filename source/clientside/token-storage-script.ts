
import {authShape} from "authoritarian/dist-cjs/shapes"
import {AuthApi} from "authoritarian/dist-cjs/interfaces"
import {apiNodeClient} from "renraku/dist-cjs/api-node-client"
import {crosscallHost} from "crosscall/dist-cjs/crosscall-host"

import {TokenStorage} from "./services/token-storage"

main()
	.then(() => console.log("🎟️ token script"))
	.catch(error => console.error(error))

async function main() {
	const {authExchanger} = apiNodeClient<AuthApi>({
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
