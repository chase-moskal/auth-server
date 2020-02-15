
// TODO cjs
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _mongodb from "mongodb"
const mongodb = require("mongodb") as typeof _mongodb


import {UserRecord} from "../interfaces.js"
import {User} from "authoritarian/dist/interfaces.js"

export const recordToUser = (record: UserRecord): User => ({
	userId: record._id.toHexString(),
	claims: record.claims
})

export async function findUserById(
	usersCollection: _mongodb.Collection,
	userId: string
): Promise<User> {
	const _id = new mongodb.ObjectId(userId)
	const record = await usersCollection.findOne<UserRecord>({_id})
	return recordToUser(record)
}
