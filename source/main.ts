
import Koa from "./commonjs/koa.js"
import * as pug from "./commonjs/pug.js"
import cors from "./commonjs/koa-cors.js"
import mount from "./commonjs/koa-mount.js"
import serve from "./commonjs/koa-static.js"
import googleAuth from "./commonjs/google-auth-library.js"

import {promises} from "fs"
import {apiServer} from "renraku/dist/api-server.js"
import {unpackCorsConfig}
	from "authoritarian/dist/toolbox/unpack-cors-config.js"
import {createProfileMagistrateClient}
	from "authoritarian/dist/clients/create-profile-magistrate-client.js"

import {Config, AuthApi} from "./interfaces.js"
import {httpHandler} from "./toolbox/http-handler.js"
import {connectMongo} from "./toolbox/connect-mongo.js"
import {createAuthExchanger} from "./api/auth-exchanger.js"
import {prepareUsersDatabase} from "./api/users-database.js"
import {AccountPopupSettings, TokenStorageConfig}
	from "./clientside/interfaces.js"
import {ClaimsDealerTopic, ClaimsVanguardTopic}
	from "authoritarian/dist/interfaces.js"

const configPath = "config"
const read = (path: string) => promises.readFile(path, "utf8")
const getTemplate = async(filename: string) =>
	pug.compile(await read(`source/clientside/templates/${filename}`))

main().catch(error => console.error(error))

export async function main() {

	//
	// loading config, templates, and preparing connections
	//

	const config: Config = JSON.parse(await read(`${configPath}/config.json`))
	const publicKey = await read(`${configPath}/auth-server.public.pem`)
	const privateKey = await read(`${configPath}/auth-server.private.pem`)

	const templates = {
		accountPopup: await getTemplate("account-popup.pug"),
		tokenStorage: await getTemplate("token-storage.pug"),
	}

	//
	// static html frontend
	//

	const htmlKoa = new Koa()
		.use(cors())

		// token storage
		.use(httpHandler("get", "/token-storage", async() => {
			console.log("/token-storage")
			const settings: TokenStorageConfig = config.tokenStorage
			return templates.tokenStorage({settings})
		}))

		// account popup
		.use(httpHandler("get", "/account-popup", async() => {
			console.log("/account-popup")
			const {clientId, redirectUri} = config.google
			const settings: AccountPopupSettings = {
				...config.accountPopup,
				debug: config.debug,
				googleAuthDetails: {clientId, redirectUri}
			}
			return templates.accountPopup({settings})
		}))

		// static clientside content
		.use(serve("dist/clientside"))

	//
	// json rpc api
	//

	const usersDatabase = prepareUsersDatabase(
		await connectMongo(config.usersDatabase)
	)

	const profileMagistrate = await createProfileMagistrateClient(
		config.profileServerConnection
	)

	const {getUser, createUser, setClaims} = usersDatabase
	const claimsDealer: ClaimsDealerTopic = {getUser}
	const claimsVanguard: ClaimsVanguardTopic = {createUser, setClaims}

	const authExchanger = createAuthExchanger({
		publicKey,
		privateKey,
		usersDatabase,
		profileMagistrate,
		accessTokenExpiresMilliseconds: 20 * (60 * 1000), // twenty minutes
		refreshTokenExpiresMilliseconds: 60 * (24 * 60 * 60 * 1000), // sixty days
		googleClientId: config.google.clientId,
		oAuth2Client: new googleAuth.OAuth2Client(config.google.clientId),
	})

	const {koa: apiKoa} = await apiServer<AuthApi>({
		logger: console,
		debug: config.debug,
		exposures: {
			claimsDealer: {
				exposed: claimsDealer,
				cors: unpackCorsConfig(config.claimsDealer.cors)
			},
			claimsVanguard: {
				exposed: claimsVanguard,
				whitelist: {}
			},
			authExchanger: {
				exposed: authExchanger,
				cors: unpackCorsConfig(config.authExchanger.cors)
			}
		}
	})

	//
	// run the koa server app
	//

	const host = "0.0.0.0"
	const port = config.port

	new Koa()

		// account popup and token storage
		.use(mount("/html", htmlKoa))

		// serving up the node_modules for local dev
		.use(mount("/node_modules", new Koa()
			.use(cors())
			.use(serve("node_modules"))
		))

		// renraku json rpc api
		.use(mount("/api", apiKoa))

		// start the server
		.listen({host, port})

	console.log(`🌐 auth-server on ${config.port}`)
}
