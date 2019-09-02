
import {LoginTopic, AccessToken} from "authoritarian"

export class LoginService implements LoginTopic {
	async userLoginRoutine(): Promise<AccessToken> {
		return "a123"
	}
}
