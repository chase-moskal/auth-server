
import {profileShape} from "authoritarian/dist/shapes.js"
import {ProfileApi} from "authoritarian/dist/interfaces.js"
import {apiNodeClient} from "renraku/dist/api-node-client.js"

export function createProfileClient({url}: {url: string}) {
	return apiNodeClient<ProfileApi>({
		url,
		shape: profileShape,
	})
}
