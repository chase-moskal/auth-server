
import {Collection, ObjectId} from "mongodb"
import {
	User,
	Claims,
	ClaimsVanguardTopic,
} from "authoritarian/dist-cjs/interfaces"

interface UserRecord {
	_id?: ObjectId
	googleId: string
	public: {
		claims: Claims
	}
	private: {
		claims: Claims
	}
}

const recordToUser = (record: UserRecord): User => ({
	userId: record._id.toHexString(),
	public: {
		claims: record.public.claims
	},
	private: {
		claims: record.private.claims
	}
})

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
				public: {claims: {}},
				private: {claims: {}}
			}
			const {insertedId} = await usersCollection.insertOne(record)
			user = recordToUser({...record, _id: insertedId})
		}

		return user
	},

	/**
	 * Get a full user, both private and public information
	 */
	async getUser({userId}): Promise<User> {
		return findUserById(usersCollection, userId)
	},

	/**
	 * Set claims, either public, private, or both
	 */
	async setClaims({userId, publicClaims = {}, privateClaims = {}}) {
		const _id = new ObjectId(userId)
		await usersCollection.updateOne({_id}, {
			public: {$set: {claims: {$set: publicClaims}}},
			private: {$set: {claims: {$set: privateClaims}}},
		})
		return findUserById(usersCollection, userId)
	}
})

async function findUserById(
	usersCollection: Collection,
	userId: string
): Promise<User> {
	const _id = new ObjectId(userId)
	const record = await usersCollection.findOne<UserRecord>({_id})
	return recordToUser(record)
}
