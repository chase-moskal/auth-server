
// TODO cjs
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _mongodb from "mongodb"
const mongodb = require("mongodb") as typeof _mongodb

import {User, ClaimsVanguardTopic}
	from "authoritarian/dist/interfaces.js"

import {UserRecord} from "./interfaces.js"
import {findUserById, recordToUser} from "./modules/user-database.js"

export const createClaimsVanguard = ({usersCollection}: {
	usersCollection: _mongodb.Collection
}): ClaimsVanguardTopic => ({

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

	async setClaims({userId, claims = {}}) {
		const _id = new mongodb.ObjectId(userId)
		await usersCollection.updateOne({_id}, {
			$set: {claims: {$set: claims}},
		})
		return findUserById(usersCollection, userId)
	}
})
