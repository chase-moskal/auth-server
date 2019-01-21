
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
		login: pug.compile(await readFile("source/templates/login.pug"))
	}

	authRouter.get("/auth/login", async context => {
		console.log("/auth/login")
		const html = templates.login(google)
		context.response.body = html
	})

	authRouter.post("/auth/n", async context => {
		console.log("/auth/n")
	})

	server.use(authRouter.routes())
	server.use(authRouter.allowedMethods())

	return server
}
