
// TODO cjs
import * as _mongodb from "mongodb"

import {User, ClaimsDealerTopic}
	from "authoritarian/dist/interfaces.js"

import {findUserById} from "./modules/user-database.js"

export const createClaimsDealer = ({usersCollection}: {
	usersCollection: _mongodb.Collection
}): ClaimsDealerTopic => ({

	async getUser({userId}): Promise<User> {
		return findUserById(usersCollection, userId)
	}
})
