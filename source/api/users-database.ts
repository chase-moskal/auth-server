
import {User} from "authoritarian/dist/interfaces.js"
import {ObjectId, Collection} from "../commonjs/mongodb.js"

import {recordToUser} from "../toolbox/record-to-user.js"
import {UserRecord, UsersDatabase} from "../interfaces.js"

export function prepareUsersDatabase(collection: Collection): UsersDatabase {

	/**
	 * fetch a specific user by id
	 */
	async function getUser({userId}: {userId: string}): Promise<User> {
		const _id = new ObjectId(userId)
		const record = await collection.findOne<UserRecord>({_id})
		return recordToUser(record)
	}

	/**
	 * fetch or create a user account linked to a google id
	 */
	async function createUser({googleId}): Promise<User> {
		const found = await collection.findOne<UserRecord>({googleId})
		let user: User

		if (found) {
			user = recordToUser(found)
		}
		else {
			const record: UserRecord = {
				googleId,
				claims: {}
			}
			const {insertedId} = await collection.insertOne(record)
			user = recordToUser({...record, _id: insertedId})
		}

		return user
	}

	/**
	 * dynamically set claims onto the user
	 */
	async function setClaims({userId, claims = {}}): Promise<User> {
		const _id = new ObjectId(userId)
		await collection.updateOne({_id}, {
			$set: {claims: {$set: claims}},
		})
		return getUser(userId)
	}

	return {getUser, createUser, setClaims}
}
