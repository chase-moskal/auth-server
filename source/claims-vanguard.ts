
import {Collection, ObjectId} from "mongodb"
import {
	User,
	ClaimsVanguardTopic,
} from "authoritarian/dist-cjs/interfaces"

import {UserRecord} from "./interfaces"
import {findUserById, recordToUser} from "./modules/user-database"

export const createClaimsVanguard = ({usersCollection}: {
	usersCollection: Collection
}): ClaimsVanguardTopic => ({

	/**
	 * Fetch or create a user in the database
	 */
	async createUser({googleId}): Promise<User> {
		const found = await usersCollection.findOne<UserRecord>({googleId})
		let user: User

		if (found) {
			user = recordToUser(found)
		}
		else {
			const record: UserRecord = {
				googleId,
				claims: {}
			}
			const {insertedId} = await usersCollection.insertOne(record)
			user = recordToUser({...record, _id: insertedId})
		}

		return user
	},

	async getUser({userId}): Promise<User> {
		return findUserById(usersCollection, userId)
	},

	async setClaims({userId, claims = {}}) {
		const _id = new ObjectId(userId)
		await usersCollection.updateOne({_id}, {
			$set: {claims: {$set: claims}},
		})
		return findUserById(usersCollection, userId)
	}
})
