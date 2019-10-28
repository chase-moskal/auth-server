
import * as pug from "pug"
import * as Koa from "koa"
import {readFile} from "fancyfs"
import * as cors from "@koa/cors"
import * as mount from "koa-mount"
import * as serve from "koa-static"
import {OAuth2Client} from "google-auth-library"
import {createApiServer} from "renraku/dist-cjs/server/create-api-server"

import {httpHandler} from "./modules/http-handler"
import {createClaimsVanguard} from "./claims-vanguard"
import {AccountPopupConfig} from "./clientside/interfaces"
import {createProfileClient} from "./modules/create-profile-client"
import {createMongoCollection} from "./modules/create-mongo-collection"

import {Config, Api} from "./interfaces"
import {createAuthExchanger} from "./auth-exchanger"
import { createClaimsDealer } from "./claims-dealer"

const getTemplate = async(filename: string) =>
	pug.compile(<string>await readFile(
		`source/clientside/templates/${filename}`,
		"utf8"
	))

main().catch(error => console.error(error))

export async function main() {
	const config: Config = JSON.parse(<string>await readFile(
		"config/config.json",
		"utf8"
	))
	const publicKey = <string>await readFile(
		"config/auth-server.public.pem",
		"utf8"
	)
	const privateKey = <string>await readFile(
		"config/auth-server.private.pem",
		"utf8"
	)
	const usersCollection = await createMongoCollection(config.usersDatabase)

	//
	// HTML KOA
	// compiles pug templates
	// also serves the clientside dir
	//

	const templates = {
		accountPopup: await getTemplate("account-popup.pug"),
		tokenStorage: await getTemplate("token-storage.pug")
	}

	const htmlKoa = new Koa()
	htmlKoa.use(cors())

	// token storage
	htmlKoa.use(httpHandler("get", "/token-storage", async() => {
		console.log("/token-storage")
		return templates.tokenStorage()
	}))

	// account popup
	htmlKoa.use(httpHandler("get", "/account-popup", async() => {
		console.log("/account-popup")
		const {clientId, redirectUri} = config.google
		const {allowedOriginsRegex} = config.authServer.accountPopup
		const accountPopupConfig: AccountPopupConfig = {
			allowedOriginsRegex,
			googleAuthDetails: {clientId, redirectUri}
		}
		return templates.accountPopup({config: accountPopupConfig})
	}))

	// static clientside content
	htmlKoa.use(serve("dist/clientside"))

	//
	// AUTH EXCHANGER
	// renraku json rpc api
	//

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

	const {koa: apiKoa} = createApiServer<Api>({
		debug: true,
		logger: console,
		topics: {
			claimsVanguard: {
				whitelist: {},
				exposed: claimsVanguard
			},
			claimsDealer: {
				cors: {
					allowed: /^http\:\/\/localhost\:8\d{3}$/i,
					forbidden: null,
				},
				exposed: claimsDealer
			},
			authExchanger: {
				cors: {
					allowed: /^http\:\/\/localhost\:8\d{3}$/i,
					forbidden: null,
				},
				exposed: authExchanger
			}
		}
	})

	//
	// run the koa server app
	//

	const koa = new Koa()
	koa.use(mount("/html", htmlKoa))
	koa.use(mount("/api", apiKoa))
	koa.listen(config.authServer.port)
	console.log(`Auth server listening on port ${config.authServer.port}`)
}
