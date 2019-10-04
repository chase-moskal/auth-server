
import {ProfilerApi} from "authoritarian/dist-cjs/interfaces"
import {profilerApiShape as shape} from "authoritarian/dist-cjs/shapes"
import {createNodeApiClient} from "renraku/dist/cjs/client/create-node-api-client"

export async function createProfilerClient({url}: {url: string}) {
	return (await createNodeApiClient<ProfilerApi>({url, shape})).profiler
}
