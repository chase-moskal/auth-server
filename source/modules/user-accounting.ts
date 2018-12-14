
import {User, QueryUserByGoogleId} from "./interfaces"

export const mockQueryUserByGoogleId: QueryUserByGoogleId = async({
	googleId
}): Promise<User> => {
	return {
		id: 1234,
		googleId,
		name: "Chase Moskal",
		email: "chasemoskal@gmail.com",
		nickname: "chaser"
	}
}
