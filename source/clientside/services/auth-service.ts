
import {AuthTopic} from "authoritarian"

export class AuthService implements AuthTopic {

	async authorize({refreshToken}: {refreshToken: string}) {
		console.log("AuthService authorize", {refreshToken})
		return "a123"
	}

	async authenticateWithGoogle({googleToken}: {googleToken: string}) {
		console.log("AuthService authenticateWithGoogle", {googleToken})

		// call to /auth
		const raw = await fetch("/auth", {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				method: "authenticateWithGoogle",
				googleToken
			})
		})

		const response = await raw.json()
		console.log("/auth response:", response)

		return {refreshToken: "r123", accessToken: "a123"}
	}
}