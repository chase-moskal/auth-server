
import {profileShape} from "authoritarian/dist-cjs/shapes"
import {ProfileApi} from "authoritarian/dist-cjs/interfaces"
import {apiNodeClient} from "renraku/dist-cjs/api-node-client"

export function createProfileClient({url}: {url: string}) {
	return apiNodeClient<ProfileApi>({
		url,
		shape: profileShape,
	})
}
