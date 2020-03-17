
import {ObjectID} from "./commonjs/mongodb.js"

import {User, Claims, AuthApi, CorsConfig}
	from "authoritarian/dist/interfaces.js"

export {AuthApi}

export interface Config {
	authServer: {
		port: number
		debug: boolean
		profileServerOrigin: string
		googleClientId: string
	}
	cors: CorsConfig
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

export interface UserRecord {
	_id?: ObjectID
	claims: Claims
	googleId: string
}
