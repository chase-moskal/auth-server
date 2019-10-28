
import {profileMagistrateShape} from "authoritarian/dist-cjs/shapes"
import {ProfileMagistrateTopic} from "authoritarian/dist-cjs/interfaces"

import {
	createNodeApiClient
} from "renraku/dist-cjs/client/create-node-api-client"

export async function createProfileClient({url}: {url: string}) {
	const {profileMagistrate} = await createNodeApiClient<{
		profileMagistrate: ProfileMagistrateTopic
	}>({
		url,
		shape: {profileMagistrate: profileMagistrateShape},
	})
	return profileMagistrate
}
