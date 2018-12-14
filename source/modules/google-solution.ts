
import * as pug from "pug"
import * as Koa from "koa"
import * as Router from "koa-router"
import {readFile} from "authoritarian"

import {GoogleConfig} from "../interfaces"
import {QueryUserByGoogleId} from "./interfaces"


export async function prepareAuthServer({google, queryUserByGoogleId}: {
	google: GoogleConfig
	queryUserByGoogleId: QueryUserByGoogleId
}): Promise<Koa> {
	const server = new Koa()
	const authRouter = new Router()

	const templates = {
		authGoogle: pug.compile(await readFile("source/templates/auth-google.pug"))
	}

	authRouter.get("/auth/google", async context => {
		console.log("/auth/google")
		const html = templates.authGoogle({clientId: google.clientId})
		context.response.body = html
	})

	authRouter.get("/auth/google-complete", async context => {
		console.log("/auth/google-complete")
		const html = templates.authGoogle({clientId: google.clientId})
		context.response.body = html
	})

	server.use(authRouter.routes())
	server.use(authRouter.allowedMethods())

	return server
}
