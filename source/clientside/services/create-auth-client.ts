
import {authShape} from "authoritarian/dist-cjs/shapes"
import {AuthApi} from "authoritarian/dist-cjs/interfaces"
import {apiNodeClient} from "renraku/dist-cjs/api-node-client"

export function createAuthClient({url}: {url: string}) {
	return apiNodeClient<AuthApi>({url, shape: authShape})
}
