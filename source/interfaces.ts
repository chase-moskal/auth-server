
import {ObjectId} from "mongodb"
import {
	Claims,
	ClaimsDealerTopic,
	AuthExchangerTopic,
	ClaimsVanguardTopic,
} from "authoritarian/dist-cjs/interfaces"
import {Api} from "renraku/dist-cjs/interfaces"

import {AccountPopupConfig} from "./clientside/interfaces"

export interface AuthApi extends Api<AuthApi> {
	claimsDealer: ClaimsDealerTopic
	authExchanger: AuthExchangerTopic
	claimsVanguard: ClaimsVanguardTopic
}

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
	googleId: string
	public: {
		claims: Claims
	}
	private: {
		claims: Claims
	}
}
