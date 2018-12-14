
import * as express from "express"
import * as passport from "passport"
import {OAuth2Strategy as GoogleStrategy} from "passport-google-oauth"

import {GoogleConfig} from "../interfaces"
import {QueryUserByGoogleId} from "./interfaces"

export async function prepareAuthServer({google, queryUserByGoogleId}: {
	google: GoogleConfig
	queryUserByGoogleId: QueryUserByGoogleId
}): Promise<express.Express> {

	//
	// prepare passport globally
	//

	passport.use(new GoogleStrategy(
		{
			clientID: google.clientId,
			clientSecret: google.clientSecret,
			callbackURL: google.callbackUrl
		},
		async(accessToken, refreshToken, profile, done) => {
			try {
				const user = await queryUserByGoogleId({googleId: profile.id})
				done(null, user)
			}
			catch (error) {
				done(error)
			}
		}
	))

	//
	// create express server
	//

	const server = express()

	server.get("/login", (request, response) => {
		response.send("login page")
	})

	server.get("/completed", (request, response) => {
		response.send("auth completed")
	})

	server.get(
		"/auth/google",
		passport.authenticate("google", {scope: ["profile"]})
	)

	server.get(
		"/auth/google/callback",
		passport.authenticate("google", {failureRedirect: "/login"}),
		(request, response) => {

			// successful authentication
			response.redirect("/completed")
		}
	)

	return server
}
