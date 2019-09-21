
import {Host as CrosscallHost} from "crosscall/dist/cjs/host"
import {AuthExchangerApi} from "authoritarian/dist/cjs/interfaces"
import {authExchangerApiShape} from "authoritarian/dist/cjs/shapes"

import {
	createApiClient as createRenrakuApiClient
} from "renraku/dist/cjs/client/create-api-client"

import {TokenStorage} from "./services/token-storage"

main()
	.then(() => console.log("🎟️ token script"))
	.catch(error => console.error(error))

async function main() {

	const {authExchanger} = await createRenrakuApiClient<AuthExchangerApi>({
		url: `${window.location.origin}/api`,
		shape: authExchangerApiShape
	})

	new CrosscallHost({
		namespace: "crosscall-example",

		callee: {
			topics: {
				tokenStorage: <any>new TokenStorage({
					authExchanger,
					storage: window.localStorage
				})
			},
			events: {}
		},

		permissions: [{
			origin: /^https?:\/\/localhost:8\d{3}$/i,
			allowedTopics: {
				testTopic: ["tokenStorage"]
			},
			allowedEvents: []
		}]
	})
}
