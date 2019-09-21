
export interface Config {
	google: GoogleConfig
	authServer: AuthServerConfig
	usersDatabase: MongoDatabaseConfig
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
