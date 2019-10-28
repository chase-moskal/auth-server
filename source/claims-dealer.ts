
import {Collection} from "mongodb"
import {
	User,
	PublicClaimsDealerTopic,
} from "authoritarian/dist-cjs/interfaces"

import {findUserById} from "./modules/user-database"

export const createClaimsDealer = async({usersCollection}: {
	usersCollection: Collection
}): Promise<PublicClaimsDealerTopic> => ({

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
