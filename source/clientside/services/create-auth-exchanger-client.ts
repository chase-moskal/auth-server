
import {AuthExchangerApi} from "authoritarian/dist/interfaces"
import {authExchangerApiShape} from "authoritarian/dist/cjs/shapes"
import {createApiClient} from "renraku/dist/cjs/client/create-api-client"

export async function createAuthExchangerClient({url}: {url: string}) {
	const {authExchanger} = await createApiClient<AuthExchangerApi>({
		url,
		shape: authExchangerApiShape
	})
	return authExchanger
}
