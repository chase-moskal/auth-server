
export interface Config {
	google: GoogleConfig
	authServer: AuthServerConfig
}

export interface AuthServerConfig {
	port: number
	loginPage: {
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
