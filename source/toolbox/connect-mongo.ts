
import {MongoDatabaseConfig} from "../interfaces.js"
import {MongoClient, Collection} from "../commonjs/mongodb.js"

export async function connectMongo({
	link,
	database,
	collection,
}: MongoDatabaseConfig): Promise<Collection> {
	const client = new MongoClient(link, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	await client.connect()
	return client.db(database).collection(collection)
}
