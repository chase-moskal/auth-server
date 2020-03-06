
import {MongoDatabaseConfig} from "../interfaces.js"
import {MongoClient, Collection} from "../commonjs/mongodb.js"

export async function connectMongo({
	uri,
	dbName,
	collectionName,
}: MongoDatabaseConfig): Promise<Collection> {
	const client = new MongoClient(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	await client.connect()
	return client.db(dbName).collection(collectionName)
}
