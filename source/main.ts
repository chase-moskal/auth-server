
import * as pug from "pug"
import * as Koa from "koa"
import * as cors from "@koa/cors"
import * as mount from "koa-mount"
import * as serve from "koa-static"
import {OAuth2Client} from "google-auth-library"
import {apiServer} from "renraku/dist/api-server.js"

import {promises as fsPromises} from "fs"
const read = (path: string) => fsPromises.readFile(path, "utf8")

import {httpHandler} from "./modules/http-handler.js"
import {AccountPopupSettings} from "./clientside/interfaces.js"
import {createProfileClient} from "./modules/create-profile-client.js"
import {createMongoCollection} from "./modules/create-mongo-collection.js"

import {Config, AuthApi} from "./interfaces.js"
import {createClaimsDealer} from "./claims-dealer.js"
import {createAuthExchanger} from "./auth-exchanger.js"
import {createClaimsVanguard} from "./claims-vanguard.js"

const getTemplate = async(filename: string) =>
	pug.compile(await read(`source/clientside/templates/${filename}`))

main().catch(error => console.error(error))

export async function main() {
	const config: Config = JSON.parse(await read("config/config.json"))

	//
	// initialization
	//

	const publicKey = await read("config/auth-server.public.pem")
	const privateKey = await read("config/auth-server.private.pem")
	const usersCollection = await createMongoCollection(config.usersDatabase)

	const templates = {
		accountPopup: await getTemplate("account-popup.pug"),
		tokenStorage: await getTemplate("token-storage.pug")
	}

	const {profileMagistrate} = createProfileClient({
		url: config.profileServerConnection.url
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
		oAuth2Client: new OAuth2Client(config.google.clientId),
	})

	//
	// static html frontend
	//

	const htmlKoa = new Koa()
		.use(cors())

		// token storage
		.use(httpHandler("get", "/token-storage", async() => {
			console.log("/token-storage")
			return templates.tokenStorage()
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

	const {koa: apiKoa} = apiServer<AuthApi>({
		logger: console,
		debug: config.debug,
		exposures: {
			claimsDealer: {
				exposed: claimsDealer,
				cors: {
					allowed: /^http\:\/\/localhost\:8\d{3}$/i,
					forbidden: null
				}
			},
			claimsVanguard: {
				exposed: claimsVanguard,
				whitelist: {}
			},
			authExchanger: {
				exposed: authExchanger,
				cors: {
					allowed: /^http\:\/\/localhost\:8\d{3}$/i,
					forbidden: null
				}
			}
		}
	})

	//
	// run the koa server app
	//

	new Koa()
		.use(mount("/html", htmlKoa))
		.use(mount("/api", apiKoa))
		.listen(config.port)

	console.log(`🌐 auth-server on ${config.port}`)
}
