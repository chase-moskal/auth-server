
export interface Config {
	authServer: AuthServerConfig
	google: GoogleConfig
}

export interface AuthServerConfig {
	port: number
}

export interface GoogleConfig {
	clientId: string
	clientSecret: string
	callbackUrl: string
}
