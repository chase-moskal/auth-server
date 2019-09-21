
import {Collection, ObjectId} from "mongodb"
import {ClaimsVanguardTopic, User, Claims} from "authoritarian/dist/cjs/interfaces"

export const createClaimsVanguard = async({usersCollection}: {
	usersCollection: Collection
}): Promise<ClaimsVanguardTopic> => ({

	async createUser({googleId}): Promise<User> {
		const found = await usersCollection.findOne<UserRecord>({googleId})
		let user: User

		if (found) {
			user = {
				userId: found._id.toHexString(),
				claims: found.claims
			}
		}
		else {
			const claims: Claims = {}
			const record: UserRecord = {
				googleId,
				claims
			}
			const {insertedId} = await usersCollection.insertOne(record)
			user = {
				userId: insertedId.toHexString(),
				claims
			}
		}

		return user
	},

	async getUser({userId}): Promise<User> {
		return findUserById(usersCollection, userId)
	},

	async setClaims({userId, claims}) {
		const _id = new ObjectId(userId)
		await usersCollection.updateOne({_id}, {claims})
		return findUserById(usersCollection, userId)
	}
})

async function findUserById(
	usersCollection: Collection,
	userId: string
): Promise<User> {
	const _id = new ObjectId(userId)
	const {claims} = await usersCollection.findOne<UserRecord>({_id})
	return {userId, claims}
}

interface UserRecord {
	_id?: ObjectId
	googleId: string
	claims: Claims
}
