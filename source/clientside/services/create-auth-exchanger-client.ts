
import {AuthExchangerApi} from "authoritarian/dist/interfaces"
import {authExchangerApiShape} from "authoritarian/dist/cjs/shapes"
import {createNodeApiClient} from "renraku/dist/cjs/client/create-node-api-client"

export async function createAuthExchangerClient({url}: {url: string}) {
	const {authExchanger} = await createNodeApiClient<AuthExchangerApi>({
		url,
		shape: authExchangerApiShape
	})
	return authExchanger
}
