
import {Collection} from "mongodb"
import {User, ClaimsDealerTopic}
	from "authoritarian/dist/interfaces.js"

import {findUserById} from "./modules/user-database.js"

export const createClaimsDealer = ({usersCollection}: {
	usersCollection: Collection
}): ClaimsDealerTopic => ({

	async getUser({userId}): Promise<User> {
		return findUserById(usersCollection, userId)
	}
})
