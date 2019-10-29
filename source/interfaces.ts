
import {ObjectId} from "mongodb"
import {
	Claims,
	ClaimsDealerTopic,
	AuthExchangerTopic,
	ClaimsVanguardTopic,
} from "authoritarian/dist-cjs/interfaces"
import {TopicApi} from "renraku/dist-cjs/interfaces"

export interface Api extends TopicApi<Api> {
	claimsDealer: ClaimsDealerTopic
	authExchanger: AuthExchangerTopic
	claimsVanguard: ClaimsVanguardTopic
}

export interface Config {
	port: number
	debug: boolean
	google: GoogleConfig
	usersDatabase: MongoDatabaseConfig
	profileMagistrateConnection: ProfileMagistrateConnection
	accountPopup: {
		allowedOriginsRegex: [string, string]
	}
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

export interface ProfileMagistrateConnection {
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
