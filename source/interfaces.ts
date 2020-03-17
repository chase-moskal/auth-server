
import {ObjectID} from "./commonjs/mongodb.js"

import {User, Claims, AuthApi, CorsConfig}
	from "authoritarian/dist/interfaces.js"

import {AccountPopupConfig, TokenStorageConfig}
	from "./clientside/interfaces.js"

export {AuthApi}

export interface Config {
	port: number
	debug: boolean
	cors: CorsConfig
	google: GoogleConfig
	profileServerOrigin: string
	mongo: {
		link: string
		database: string
	}
}

export interface UsersDatabase {
	getUser(o: {userId: string}): Promise<User>
	createUser(o: {googleId: string}): Promise<User>
	setClaims(o: {userId: string, claims?: Claims}): Promise<User>
}

export interface ClaimsDealerConfig {
	cors: CorsConfig
}

export interface AuthExchangerConfig {
	cors: CorsConfig
}

export interface MongoDatabaseConfig {
	link: string
	database: string
	collection: string
}

export interface GoogleConfig {
	clientId: string
}

export interface UserRecord {
	_id?: ObjectID
	claims: Claims
	googleId: string
}
