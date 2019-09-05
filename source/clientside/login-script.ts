
// import {Host as CrosscallHost} from "crosscall"

import {GoogleAuthDetails} from "./interfaces"
import {GoogleMagic} from "./services/google-magic"
import {AuthService} from "./services/auth-service"
import {LoginService} from "./services/login-service"
import {TokenService} from "./services/token-service"

declare global {
	interface Window {
		googleAuthDetails: GoogleAuthDetails
		loginScript: typeof loginScript
	}
}

async function loginScript() {
	const {googleAuthDetails} = window
	const googleMagic = new GoogleMagic(googleAuthDetails)
	const authService = new AuthService()
	const tokenService = new TokenService({
		authService,
		storage: window.sessionStorage
	})
	const loginService = new LoginService({
		googleMagic,
		authService,
		tokenService
	})
	const token = await loginService.userLoginRoutine()
	console.log("USER LOGIN ROUTINE COMPLETE", token)
}

window.loginScript = loginScript

// const host = new CrosscallHost({
// 	callee: {
// 		topics: {
// 			loginService: <any>loginService
// 		},
// 		events: {}
// 	},
// 	permissions: [{
// 		origin: /^http:\/\/localhost:8080$/,
// 		allowedTopics: {
// 			exampleTopic: ["loginService"]
// 		},
// 		allowedEvents: []
// 	}]
// })
