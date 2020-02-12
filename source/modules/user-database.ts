
import {Collection, ObjectId} from "mongodb"
import {User} from "authoritarian/dist/interfaces.js"

import {UserRecord} from "../interfaces.js"

export const recordToUser = (record: UserRecord): User => ({
	userId: record._id.toHexString(),
	claims: record.claims
})

export async function findUserById(
	usersCollection: Collection,
	userId: string
): Promise<User> {
	const _id = new ObjectId(userId)
	const record = await usersCollection.findOne<UserRecord>({_id})
	return recordToUser(record)
}

