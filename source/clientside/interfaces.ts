
export interface GoogleAuthDetails {
	clientId: string
	redirectUri: string
}

export interface GoogleAuthFixed extends gapi.auth2.GoogleAuth {
	then: undefined
}

export interface GoogleMagicTopic {
	initGoogleAuth(): Promise<void>
	prepareGoogleSignInButton(): Promise<gapi.auth2.GoogleUser>
	prepareGoogleSignOutButton(options: {button: HTMLElement}): void
}
