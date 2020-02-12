
import {Collection} from "mongodb"
import {User, ClaimsDealerTopic}
	from "authoritarian/dist-cjs/interfaces"

import {findUserById} from "./modules/user-database"

export const createClaimsDealer = ({usersCollection}: {
	usersCollection: Collection
}): ClaimsDealerTopic => ({

	async getUser({userId}): Promise<User> {
		return findUserById(usersCollection, userId)
	}
})
