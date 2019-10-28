
import {Collection} from "mongodb"
import {
	User,
	ClaimsDealerTopic,
} from "authoritarian/dist-cjs/interfaces"

import {findUserById} from "./modules/user-database"

export const createClaimsDealer = ({usersCollection}: {
	usersCollection: Collection
}): ClaimsDealerTopic => ({

	/**
	 * Fetch a user's public information
	 */
	async getPublicUser({userId}): Promise<User> {
		const found: User = await findUserById(usersCollection, userId)
		let user: User = null
		if (found) {
			user = {
				userId: found.userId,
				public: found.public,
			}
		}
		return user
	}
})
