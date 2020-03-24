
import Koa from "./commonjs/koa.js"
import * as pug from "./commonjs/pug.js"
import cors from "./commonjs/koa-cors.js"
import mount from "./commonjs/koa-mount.js"
import serve from "./commonjs/koa-static.js"
import logger from "./commonjs/koa-logger.js"

import {apiServer} from "renraku/dist/api-server.js"

import {AuthApi} from "authoritarian/dist/interfaces.js"
import {AuthServerConfig} from "authoritarian/dist/interfaces.js"
import {read, readYaml} from "authoritarian/dist/toolbox/reading.js"
import {httpHandler} from "authoritarian/dist/toolbox/http-handler.js"
import {connectMongo} from "authoritarian/dist/toolbox/connect-mongo.js"
import {unpackCorsConfig} from "authoritarian/dist/toolbox/unpack-cors-config.js"
import {makeAuthVanguard} from "authoritarian/dist/business/auth-api/vanguard.js"
import {makeSignToken} from "authoritarian/dist/toolbox/tokens/make-sign-token.js"
import {makeAuthExchanger} from "authoritarian/dist/business/auth-api/exchanger.js"
import {makeVerifyToken} from "authoritarian/dist/toolbox/tokens/make-verify-token.js"
import {mongoUserDatalayer} from "authoritarian/dist/business/auth-api/mongo-user-datalayer.js"
import {makeVerifyGoogleToken} from "authoritarian/dist/business/auth-api/make-verify-google-token.js"
import {makeProfileMagistrateClient} from "authoritarian/dist/business/profile-magistrate/magistrate-client.js"

import {generateName} from "./toolbox/generate-name.js"
import {AccountPopupSettings, TokenStorageConfig} from "./clientside/interfaces.js"

const paths = {
	config: "config/config.yaml",
	publicKey: "config/auth-server.public.pem",
	privateKey: "config/auth-server.private.pem",
}

const getTemplate = async(filename: string) =>
	pug.compile(await read(`source/clientside/templates/${filename}`))

~async function main() {

	// config, token keys, and database
	const config: AuthServerConfig = await readYaml(paths.config)
	const {port} = config.authServer
	const publicKey = await read(paths.publicKey)
	const privateKey = await read(paths.privateKey)
	const usersCollection = await connectMongo(config.mongo, "users")

	// profile magistrate - renraku client connection
	const profileMagistrate = await makeProfileMagistrateClient({
		profileServerOrigin: config.authServer.profileServerOrigin
	})

	// generate auth-vanguard and the lesser auth-dealer
	const userDatalayer = mongoUserDatalayer(usersCollection)
	const {authVanguard, authDealer} = makeAuthVanguard({userDatalayer})

	// prepare token signers and verifiers
	const signToken = makeSignToken(privateKey)
	const verifyToken = makeVerifyToken(publicKey)
	const verifyGoogleToken = makeVerifyGoogleToken(
		config.authServer.googleClientId
	)

	// create the auth exchanger
	const authExchanger = makeAuthExchanger({
		signToken,
		verifyToken,
		authVanguard,
		profileMagistrate,
		verifyGoogleToken,
		generateRandomNickname: () => generateName(),
		accessTokenExpiresMilliseconds: 20 * (60 * 1000), // twenty minutes
		refreshTokenExpiresMilliseconds: 60 * (24 * 60 * 60 * 1000), // sixty days
	})

	//
	// html clientside
	//

	const templates = {
		accountPopup: await getTemplate("account-popup.pug"),
		tokenStorage: await getTemplate("token-storage.pug"),
	}

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
			const settings: AccountPopupSettings = {
				cors: config.cors,
				debug: config.authServer.debug,
				googleAuthDetails: {clientId: config.authServer.googleClientId}
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
		debug: config.authServer.debug,
		exposures: {
			authExchanger: {
				exposed: authExchanger,
				cors: unpackCorsConfig(config.cors)
			},
			authVanguard: {
				exposed: authVanguard,
				whitelist: {}
			},
			authDealer: {
				exposed: authDealer,
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
		.listen({host: "0.0.0.0", port})

	console.log(`🌐 auth-server on ${port}`)
}()
