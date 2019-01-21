
export interface Config {
	authServer: AuthServerConfig
	google: GoogleConfig
}

export interface AuthServerConfig {
	port: number
}

export interface GoogleConfig {
	scope: string
	clientId: string
	clientSecret: string
	callbackUrl: string
	redirectUri: string
}
