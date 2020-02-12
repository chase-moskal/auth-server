
import {ObjectId} from "mongodb"
import {Claims, AuthApi}
	from "authoritarian/dist-cjs/interfaces"

import {AccountPopupConfig} from "./clientside/interfaces"

export {AuthApi}

export interface Config {
	port: number
	debug: boolean
	google: GoogleConfig
	accountPopup: AccountPopupConfig
	usersDatabase: MongoDatabaseConfig
	profileServerConnection: profileServerConnection
}

export interface MongoDatabaseConfig {
	uri: string
	dbName: string
	collectionName: string
}

export interface GoogleConfig {
	scope: string
	clientId: string
	callbackUrl: string
	redirectUri: string
	clientSecret: string
}

export interface profileServerConnection {
	url: string
}

export interface UserRecord {
	_id?: ObjectId
	claims: Claims
	googleId: string
}
