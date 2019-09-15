
import * as pug from "pug"
import * as Koa from "koa"
import {readFile} from "fancyfs"
import * as mount from "koa-mount"
import * as serve from "koa-static"
import * as Router from "koa-router"
import * as bodyParser from "koa-bodyparser"
import {OAuth2Client} from "google-auth-library"
import {AuthTokens} from "authoritarian/dist/cjs/interfaces"

import {Config} from "./interfaces"
import {createAuthApi} from "./modules/create-auth-api"

const getTemplate = async(filename: string) =>
	pug.compile(<string>await readFile(`source/clientside/templates/${filename}`, "utf8"))

main().catch(error => console.error(error))

export async function main() {
	const config: Config = JSON.parse(<string>await readFile("config/config.json", "utf8"))

	//
	// setup boring stuff
	//

	const oAuth2Client = new OAuth2Client(config.google.clientId)

	const authRouter = new Router()
	authRouter.use(bodyParser())

	const authApi = createAuthApi({
		googleClientId: config.google.clientId,
		oAuth2Client
	})

	const templates = {
		login: await getTemplate("login.pug"),
		token: await getTemplate("token.pug")
	}

	//
	// token api
	//

	authRouter.get("/token", async context => {
		console.log("/token")
		const html = templates.token()
		context.response.body = html
	})

	//
	// login api
	//

	authRouter.get("/login", async context => {
		console.log("/login")
		const html = templates.login(config.google)
		context.response.body = html
	})

	//
	// auth api
	//

	authRouter.post("/auth", async context => {
		const body = context.request.body
		const method = body.method
		console.log(`/auth "${method}"`)

		if (method === "authenticateWithGoogle") {
			const {googleToken} = body
			const authTokens: AuthTokens = await authApi.authenticateViaGoogle({
				googleToken
			})
			context.response.body = JSON.stringify(authTokens)
		}
		else {
			throw new Error(`unknown method "${method}"`)
		}
	})

	//
	// run the koa server app
	//

	const app = new Koa()
	app.use(authRouter.middleware())
	app.use(mount("/", serve("dist/clientside")))
	app.listen(config.authServer.port)
	console.log(`Auth server listening on port ${config.authServer.port}`)
}
