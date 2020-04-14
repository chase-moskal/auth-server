
import Koa from "./commonjs/koa.js"
import * as pug from "./commonjs/pug.js"
import cors from "./commonjs/koa-cors.js"
import mount from "./commonjs/koa-mount.js"
import serve from "./commonjs/koa-static.js"

import {apiServer} from "renraku/dist/api-server.js"
import {currySignToken} from "redcrypto/dist/curries/curry-sign-token.js"
import {curryVerifyToken} from "redcrypto/dist/curries/curry-verify-token.js"

import {AuthApi} from "authoritarian/dist/interfaces.js"
import {health} from "authoritarian/dist/toolbox/health.js"
import {Logger} from "authoritarian/dist/toolbox/logger.js"
import {AuthServerConfig} from "authoritarian/dist/interfaces.js"
import {read, readYaml} from "authoritarian/dist/toolbox/reading.js"
import {httpHandler} from "authoritarian/dist/toolbox/http-handler.js"
import {connectMongo} from "authoritarian/dist/toolbox/connect-mongo.js"
import {deathWithDignity} from "authoritarian/dist/toolbox/death-with-dignity.js"
import {unpackCorsConfig} from "authoritarian/dist/toolbox/unpack-cors-config.js"
import {makeAuthVanguard} from "authoritarian/dist/business/auth-api/vanguard.js"
import {makeAuthExchanger} from "authoritarian/dist/business/auth-api/exchanger.js"
import {mongoUserDatalayer} from "authoritarian/dist/business/auth-api/mongo-user-datalayer.js"
import {curryVerifyGoogleToken} from "authoritarian/dist/business/auth-api/curry-verify-google-token.js"
// import {makeProfileMagistrateClient} from "authoritarian/dist/business/profile-magistrate/magistrate-client.js"

import {makeProfileMagistrate} from "authoritarian/dist/business/profile-magistrate/magistrate.js"
import {mongoProfileDatalayer} from "authoritarian/dist/business/profile-magistrate/mongo-profile-datalayer.js"

import {generateName} from "./toolbox/generate-name.js"
import {AccountPopupSettings, TokenStorageConfig} from "./clientside/interfaces.js"

const logger = new Logger()
deathWithDignity({logger})

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
	const database = await connectMongo(config.mongo)
	const usersCollection = database.collection("users")
	const profilesCollection = database.collection("profiles")

	// generate a genuine profile magistrate
	const profileMagistrate = makeProfileMagistrate({
		verifyToken: curryVerifyToken(publicKey),
		profileDatalayer: mongoProfileDatalayer({collection: profilesCollection}),
	})

	// generate auth-vanguard and the lesser auth-dealer
	const userDatalayer = mongoUserDatalayer(usersCollection)
	const {authVanguard, authDealer} = makeAuthVanguard({userDatalayer})

	// prepare token signers and verifiers
	const signToken = currySignToken(privateKey)
	const verifyToken = curryVerifyToken(publicKey)
	const verifyGoogleToken = curryVerifyGoogleToken(
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
			logger.log(`html /token-storage`)
			const settings: TokenStorageConfig = {cors: config.cors}
			return templates.tokenStorage({settings})
		}))

		// account popup is a popup to facilitate oauth routines
		.use(httpHandler("get", "/account-popup", async() => {
			logger.log(`html /account-popup`)
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
		logger,
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

		// simple health check
		.use(health({logger}))

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

	logger.info(`🌐 auth-server on ${port}`)

}().catch(error => logger.error(error))
