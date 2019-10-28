
import {Host as CrosscallHost} from "crosscall/dist/cjs/host"
import {authExchangerShape} from "authoritarian/dist-cjs/shapes"
import {AuthExchangerTopic} from "authoritarian/dist-cjs/interfaces"

import {
	createNodeApiClient,
} from "renraku/dist-cjs/client/create-node-api-client"

import {TokenStorage} from "./services/token-storage"

main()
	.then(() => console.log("🎟️ token script"))
	.catch(error => console.error(error))

async function main() {
	const {authExchanger} = await createNodeApiClient<{
		authExchanger: AuthExchangerTopic
	}>({
		url: `${window.location.origin}/api`,
		shape: {authExchanger: authExchangerShape}
	})

	new CrosscallHost({
		namespace: "authoritarian-token-storage",

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
				tokenStorage: ["passiveCheck", "clearTokens", "writeTokens"]
			},
			allowedEvents: []
		}]
	})
}
