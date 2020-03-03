
// TODO cjs
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _pug from "pug"
import * as _Koa from "koa"
import * as _cors from "@koa/cors"
import * as _mount from "koa-mount"
import * as _serve from "koa-static"
import * as _googleAuth from "google-auth-library"
const pug: typeof _pug = require("pug") as typeof _pug
const Koa: typeof _Koa = require("koa") as typeof _Koa
const cors: typeof _cors = require("@koa/cors") as typeof _cors
const mount: typeof _mount = require("koa-mount") as typeof _mount
const serve: typeof _serve = require("koa-static") as typeof _serve
const googleAuth: typeof _googleAuth =
	require("google-auth-library") as typeof _googleAuth

import {promises} from "fs"
import {apiServer} from "renraku/dist/api-server.js"
import {createProfileMagistrateClient}
	from "authoritarian/dist/clients/create-profile-magistrate-client.js"
import {unpackCorsConfig}
	from "authoritarian/dist/toolbox/unpack-cors-config.js"

import {httpHandler} from "./modules/http-handler.js"
import {createMongoCollection} from "./modules/create-mongo-collection.js"
import {AccountPopupSettings, TokenStorageConfig}
	from "./clientside/interfaces.js"

import {Config, AuthApi} from "./interfaces.js"
import {createClaimsDealer} from "./claims-dealer.js"
import {createAuthExchanger} from "./auth-exchanger.js"
import {createClaimsVanguard} from "./claims-vanguard.js"

const configPath = "config"

const read = (path: string) => promises.readFile(path, "utf8")

const getTemplate = async(filename: string) =>
	pug.compile(await read(`source/clientside/templates/${filename}`))

main().catch(error => console.error(error))

export async function main() {
	const config: Config = JSON.parse(await read(`${configPath}/config.json`))

	//
	// initialization
	//

	const publicKey = await read(`${configPath}/auth-server.public.pem`)
	const privateKey = await read(`${configPath}/auth-server.private.pem`)
	const usersCollection = await createMongoCollection(config.usersDatabase)

	const templates = {
		accountPopup: await getTemplate("account-popup.pug"),
		tokenStorage: await getTemplate("token-storage.pug")
	}

	const profileMagistrate = await createProfileMagistrateClient({
		authServerOrigin: config.profileServerConnection.authServerOrigin
	})

	const claimsDealer = createClaimsDealer({usersCollection})
	const claimsVanguard = createClaimsVanguard({usersCollection})
	const authExchanger = createAuthExchanger({
		publicKey,
		privateKey,
		claimsDealer,
		claimsVanguard,
		profileMagistrate,
		accessTokenExpiresMilliseconds: 20 * (60 * 1000), // twenty minutes
		refreshTokenExpiresMilliseconds: 60 * (24 * 60 * 60 * 1000), // sixty days
		googleClientId: config.google.clientId,
		oAuth2Client: new googleAuth.OAuth2Client(config.google.clientId),
	})

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
		.listen(config.port)

	console.log(`🌐 auth-server on ${config.port}`)
}
