
import {ProfileMagistrateApi} from "authoritarian/dist-cjs/interfaces"

import {
	profileMagistrateApiShape as shape
} from "authoritarian/dist-cjs/shapes"

import {
	createNodeApiClient
} from "renraku/dist/cjs/client/create-node-api-client"

export async function createProfileClient({url}: {url: string}) {
	const {profileMagistrate} = await createNodeApiClient<ProfileMagistrateApi>({
		url,
		shape,
	})
	return profileMagistrate
}
