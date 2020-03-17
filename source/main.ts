
const paths = {
	config: "config/config.yaml",
	publicKey: "config/auth-server.public.pem",
	privateKey: "config/auth-server.private.pem",
}

import Koa from "./commonjs/koa.js"
import * as pug from "./commonjs/pug.js"
import cors from "./commonjs/koa-cors.js"
import mount from "./commonjs/koa-mount.js"
import serve from "./commonjs/koa-static.js"
import logger from "./commonjs/koa-logger.js"
import googleAuth from "./commonjs/google-auth-library.js"

import {apiServer} from "renraku/dist/api-server.js"
import {unpackCorsConfig}
	from "authoritarian/dist/toolbox/unpack-cors-config.js"
import {createProfileMagistrateClient}
	from "authoritarian/dist/clients/create-profile-magistrate-client.js"
import {ClaimsDealerTopic, ClaimsVanguardTopic}
	from "authoritarian/dist/interfaces.js"

import {Config, AuthApi} from "./interfaces.js"
import {read, readYaml} from "./toolbox/reading.js"
import {httpHandler} from "./toolbox/http-handler.js"
import {connectMongo} from "./toolbox/connect-mongo.js"
import {createAuthExchanger} from "./api/auth-exchanger.js"
import {prepareUsersDatabase} from "./api/users-database.js"
import {AccountPopupSettings, TokenStorageConfig}
	from "./clientside/interfaces.js"

const getTemplate = async(filename: string) =>
	pug.compile(await read(`source/clientside/templates/${filename}`))

~async function main() {
	const config: Config = (await readYaml(paths.config)).authServer
	const publicKey = await read(paths.publicKey)
	const privateKey = await read(paths.privateKey)

	const templates = {
		accountPopup: await getTemplate("account-popup.pug"),
		tokenStorage: await getTemplate("token-storage.pug"),
	}

	const profileMagistrate = await createProfileMagistrateClient({
		profileServerOrigin: config.profileServerOrigin
	})

	const usersDatabase = prepareUsersDatabase(await connectMongo({
		...config.mongo,
		collection: "users",
	}))

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

	//
	// html clientside
	//

	const htmlKoa = new Koa()
		.use(cors())

		// token storage is a service in an iframe for cross-domain storage
		.use(httpHandler("get", "/token-storage", async() => {
			console.log(`/token-storage ${Date.now()}`)
			const settings: TokenStorageConfig = {cors: config.cors}
			return templates.tokenStorage({settings})
		}))

		// account popup is a popup to facilitate oauth routines
		.use(httpHandler("get", "/account-popup", async() => {
			console.log(`/account-popup ${Date.now()}`)
			const {clientId} = config.google
			const settings: AccountPopupSettings = {
				cors: config.cors,
				debug: config.debug,
				googleAuthDetails: {clientId}
			}
			return templates.accountPopup({settings})
		}))

		// serving the static clientside files
		.use(serve("dist/clientside"))

	//
	// json rpc api
	//

	const {koa: apiKoa} = await apiServer<AuthApi>({
		logger: console,
		debug: config.debug,
		exposures: {
			authExchanger: {
				exposed: authExchanger,
				cors: unpackCorsConfig(config.cors)
			},
			claimsVanguard: {
				exposed: claimsVanguard,
				whitelist: {}
			},
			claimsDealer: {
				exposed: claimsDealer,
				cors: unpackCorsConfig(config.cors)
			},
		}
	})

	//
	// mount up the koa parts and run the server
	//

	new Koa()
		.use(logger())

		// mount html for account popup and token storage
		.use(mount("/html", htmlKoa))

		// serve node_modules for local dev
		.use(mount("/node_modules", new Koa()
			.use(cors())
			.use(serve("node_modules"))
		))

		// auth api
		.use(mount("/api", apiKoa))

		// start the server
		.listen({host: "0.0.0.0", port: config.port})

	console.log(`🌐 auth-server on ${config.port}`)
}()
