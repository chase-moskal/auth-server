
import * as pug from "pug"
import * as Koa from "koa"
import * as cors from "@koa/cors"
import * as mount from "koa-mount"
import * as serve from "koa-static"
import {OAuth2Client} from "google-auth-library"
import {createApiServer} from "renraku/dist-cjs/server/create-api-server"

import {promises as fsPromises} from "fs"
const read = (path: string) => fsPromises.readFile(path, "utf8")

import {httpHandler} from "./modules/http-handler"
import {createClaimsVanguard} from "./claims-vanguard"
import {AccountPopupConfig} from "./clientside/interfaces"
import {createProfileClient} from "./modules/create-profile-client"
import {createMongoCollection} from "./modules/create-mongo-collection"

import {Config, Api} from "./interfaces"
import {createClaimsDealer} from "./claims-dealer"
import {createAuthExchanger} from "./auth-exchanger"

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

	const claimsDealer = createClaimsDealer({usersCollection})
	const claimsVanguard = createClaimsVanguard({usersCollection})
	const authExchanger = createAuthExchanger({
		publicKey,
		privateKey,
		claimsVanguard,
		accessTokenExpiresIn: "20m",
		refreshTokenExpiresIn: "60d",
		googleClientId: config.google.clientId,
		oAuth2Client: new OAuth2Client(config.google.clientId),
		profileMagistrate: await createProfileClient({
			url: config.profileMagistrateConnection.url
		})
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
			const {allowedOriginsRegex} = config.accountPopup
			const accountPopupConfig: AccountPopupConfig = {
				allowedOriginsRegex,
				googleAuthDetails: {clientId, redirectUri}
			}
			return templates.accountPopup({config: accountPopupConfig})
		}))

		// static clientside content
		.use(serve("dist/clientside"))

	//
	// json rpc api
	//

	const {koa: apiKoa} = createApiServer<Api>({
		logger: console,
		debug: config.debug,
		topics: {
			claimsVanguard: {
				exposed: claimsVanguard,
				whitelist: {}
			},
			claimsDealer: {
				exposed: claimsDealer,
				cors: {
					allowed: /^http\:\/\/localhost\:8\d{3}$/i,
					forbidden: null
				}
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

	console.log(`🌐 auth-server listening on port ${config.port}`)
}
