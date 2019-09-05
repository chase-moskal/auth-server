
import {AuthTopic} from "authoritarian"

export class AuthService implements AuthTopic {

	async authorize({refreshToken}: {refreshToken: string}) {
		console.log("AuthService authorize", {refreshToken})
		return "a123"
	}

	async authenticateWithGoogle({googleToken}: {googleToken: string}) {
		console.log("AuthService authenticateWithGoogle", {googleToken})
		return {refreshToken: "r123", accessToken: "a123"}
	}
}
