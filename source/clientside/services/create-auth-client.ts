
import {authShape} from "authoritarian/dist/shapes.js"
import {AuthApi} from "authoritarian/dist/interfaces.js"
import {apiClient} from "renraku/dist/api-client.js"

export async function createAuthExchangerClient({url}: {url: string}) {
	return apiClient<AuthApi>({url, shape: authShape})
}
