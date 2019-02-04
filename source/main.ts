
import * as pug from "pug"
import * as Koa from "koa"
import * as mount from "koa-mount"
import * as serve from "koa-static"
import * as Router from "koa-router"
import {AuthTokens} from "authoritarian"
import {readFile, readJson} from "fancyfs"
import * as bodyParser from "koa-bodyparser"
import {OAuth2Client} from "google-auth-library"

import {Config} from "./interfaces"
import {createAuthApi} from "./modules/create-auth-api"

export async function main() {
	const config = await readJson<Config>("config.json")

	//
	// setup boring stuff
	//

	const authRouter = new Router()
	authRouter.use(bodyParser())
	const oAuth2Client = new OAuth2Client(config.google.clientId)
	const templates = {
		login: pug.compile(await readFile("source/templates/login.pug"))
	}
	const authApi = createAuthApi({
		googleClientId: config.google.clientId,
		oAuth2Client
	})

	//
	// token api
	//

	// // serve up the token page (which has the crosscall TokenApi)
	// authRouter.get("/token", async context => {
	// 	console.log("/token")
	// 	const html = templates.token()
	// 	context.response.body = html
	// })

	//
	// login api
	//

	// serve up the login page (which has the crosscall LoginApi)
	authRouter.get("/login", async context => {
		console.log("/login")
		const html = templates.login(config.google)
		context.response.body = html
	})

	//
	// auth api
	//

	// serve up the auth api
	authRouter.post("/auth", async context => {
		const body = context.request.body
		const method = body.method
		console.log(`/auth "${method}"`)

		if (method === "authenticateWithGoogle") {
			const {googleToken} = body
			const authTokens: AuthTokens = await authApi.authenticateWithGoogle({
				googleToken
			})
			context.response.body = JSON.stringify(authTokens)
		}
		else {
			throw new Error(`unknown method "${method}"`)
		}
	})

	// run the koa server
	const app = new Koa()
	app.use(authRouter.middleware())
	app.use(mount("/auth", serve("dist/clientside")))
	app.listen(config.authServer.port)
	console.log(`Auth server listening on port ${config.authServer.port}`)
}

main().catch(error => console.error(error))
