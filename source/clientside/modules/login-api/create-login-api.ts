
import {LoginTopic, AccessToken} from "authoritarian"

export const createLoginApi = (): LoginTopic => ({
	async userLoginRoutine(): Promise<AccessToken> {
		return "a123"
	}
})
