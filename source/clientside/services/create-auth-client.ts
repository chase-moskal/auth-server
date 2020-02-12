
import {authShape} from "authoritarian/dist/shapes.js"
import {AuthApi} from "authoritarian/dist/interfaces.js"
import {apiNodeClient} from "renraku/dist/api-node-client.js"

export function createAuthClient({url}: {url: string}) {
	return apiNodeClient<AuthApi>({url, shape: authShape})
}
