
// import {Host as CrosscallHost} from "crosscall"

import {GoogleAuthDetails} from "./interfaces"
import {LoginService} from "./modules/login-service"

declare global {
	interface Window {
		googleAuthDetails: GoogleAuthDetails
		loginScript: typeof loginScript
	}
}

async function loginScript() {
	const {googleAuthDetails} = window
	const loginService = new LoginService({googleAuthDetails})
	const token = await loginService.userLoginRoutine()
	console.log("TOKEN LOL", token)
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
