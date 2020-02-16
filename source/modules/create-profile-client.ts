
import {apiClient} from "renraku/dist/api-client.js"
import {profileShape} from "authoritarian/dist/shapes.js"
import {ProfileApi} from "authoritarian/dist/interfaces.js"

export async function createProfileClient({url}: {url: string}) {
	return apiClient<ProfileApi>({
		url,
		shape: profileShape,
	})
}
