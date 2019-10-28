
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
	google: GoogleConfig
	authServer: AuthServerConfig
	usersDatabase: MongoDatabaseConfig
	profileMagistrateConnection: ProfileMagistrateConnection
}

export interface MongoDatabaseConfig {
	uri: string
	dbName: string
	collectionName: string
}

export interface AuthServerConfig {
	port: number
	accountPopup: {
		allowedOriginsRegex: [string, string]
	}
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
