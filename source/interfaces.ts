
// TODO cjs
import * as mongodb from "mongodb"

import {Claims, AuthApi, CorsConfig}
	from "authoritarian/dist/interfaces.js"

import {AccountPopupConfig, TokenStorageConfig}
	from "./clientside/interfaces.js"

export {AuthApi}

export interface Config {
	port: number
	debug: boolean
	google: GoogleConfig
	tokenStorage: TokenStorageConfig
	accountPopup: AccountPopupConfig
	claimsDealer: ClaimsDealerConfig
	usersDatabase: MongoDatabaseConfig
	authExchanger: AuthExchangerConfig
	profileServerConnection: ProfileServerConnection
}

export interface ClaimsDealerConfig {
	cors: CorsConfig
}

export interface AuthExchangerConfig {
	cors: CorsConfig
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
