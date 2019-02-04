
import {LoginApi, AccessToken} from "authoritarian"

export const createLoginApi = (): LoginApi => ({
	async userLoginRoutine(): Promise<AccessToken> {
		return "a123"
	}
})
