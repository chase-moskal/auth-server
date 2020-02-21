
// TODO cjs
import * as mongodb from "mongodb"

import {Claims, AuthApi}
	from "authoritarian/dist/interfaces.js"

import {AccountPopupConfig} from "./clientside/interfaces.js"

export {AuthApi}

export interface Config {
	port: number
	debug: boolean
	google: GoogleConfig
	accountPopup: AccountPopupConfig
	usersDatabase: MongoDatabaseConfig
	profileServerConnection: ProfileServerConnection
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

export interface ProfileServerConnection {
	authServerOrigin: string
}

export interface UserRecord {
	_id?: mongodb.ObjectId
	claims: Claims
	googleId: string
}
