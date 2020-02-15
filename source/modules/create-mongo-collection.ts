
// TODO cjs
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _mongodb from "mongodb"
const mongodb = require("mongodb") as typeof _mongodb

import {MongoDatabaseConfig} from "../interfaces.js"

export async function createMongoCollection({
	uri,
	dbName,
	collectionName
}: MongoDatabaseConfig): Promise<_mongodb.Collection> {

	const client = new mongodb.MongoClient(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	await client.connect()
	return client.db(dbName).collection(collectionName)
}
