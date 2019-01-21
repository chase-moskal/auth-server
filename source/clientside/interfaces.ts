
export interface Details {
	clientId: string
	redirectUri: string
}

export interface GoogleAuthFixed extends gapi.auth2.GoogleAuth {
	then: undefined
}
