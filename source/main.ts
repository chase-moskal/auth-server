
import {readJson} from "authoritarian"

import {Config} from "./interfaces"
import {prepareAuthServer} from "./modules/prepare-auth-server"

import {
	mockQueryUserByGoogleId as queryUserByGoogleId
} from "./modules/user-accounting"

export async function main() {
	const config = await readJson<Config>("config.json")
	const app = await prepareAuthServer({googleConfig: config.google, queryUserByGoogleId})
	app.listen(config.authServer.port)
	console.log(`Auth server listening on port ${config.authServer.port}`)
}

main().catch(error => console.error(error))
