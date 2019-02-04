
import * as pug from "pug"
import * as Koa from "koa"
import {readFile} from "fancyfs"
import * as mount from "koa-mount"
import * as serve from "koa-static"
import * as Router from "koa-router"
import * as bodyParser from "koa-bodyparser"
import {OAuth2Client} from "google-auth-library"

import {GoogleConfig} from "../interfaces"
import {QueryUserByGoogleId} from "./interfaces"

export async function prepareAuthServer({googleConfig, queryUserByGoogleId}: {
	googleConfig: GoogleConfig
	queryUserByGoogleId: QueryUserByGoogleId
}): Promise<Koa> {

	const oAuth2Client = new OAuth2Client(googleConfig.clientId)
	const templates = {
		login: pug.compile(await readFile("source/templates/login.pug"))
	}

	const authRouter = new Router()
	authRouter.use(bodyParser())

	authRouter.get("/auth/login", async context => {
		console.log("/auth/login")
		const html = templates.login(googleConfig)
		context.response.body = html
	})

	authRouter.post("/auth/n", async context => {
		console.log("/auth/n")
		const body = context.request.body
		const token = body.token
		if (token) {
			const googleUserId = await verifyGoogleIdToken({
				token,
				clientId: googleConfig.clientId,
				oAuth2Client
			})
			console.log(" - googleUserId", googleUserId)
		}
		context.response.body = JSON.stringify({lol: true})
	})

	const app = new Koa()
	app.use(authRouter.middleware())
	app.use(mount("/auth", serve("dist/clientside")))
	return app
}

async function verifyGoogleIdToken({token, clientId, oAuth2Client}: {
	token: string
	clientId: string
	oAuth2Client: OAuth2Client
}): Promise<string> {
	const ticket = await oAuth2Client.verifyIdToken({
		idToken: token,
		audience: clientId
	})
	const payload = ticket.getPayload()
	const googleUserId = payload.sub
	return googleUserId
}
