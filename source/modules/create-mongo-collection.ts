
import {MongoClient, Collection} from "mongodb"
import {MongoDatabaseConfig} from "../interfaces"

export async function createMongoCollection({
	uri,
	dbName,
	collectionName
}: MongoDatabaseConfig): Promise<Collection> {

	const client = new MongoClient(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	await client.connect()
	return client.db(dbName).collection(collectionName)
}
