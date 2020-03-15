
import {CorsConfig} from "authoritarian/dist/interfaces.js"

export interface AccountPopupConfig {
	cors: CorsConfig
}

export interface TokenStorageConfig {
	cors: CorsConfig
}

export interface AccountPopupSettings extends AccountPopupConfig {
	debug: boolean
	googleAuthDetails: GoogleAuthDetails
}

export interface GoogleAuthDetails {
	clientId: string
}

export interface GoogleAuthFixed extends gapi.auth2.GoogleAuth {
	then: undefined
}

export interface GoogleAuthClientInterface {
	initGoogleAuth(): Promise<void>
	prepareGoogleSignInButton(): Promise<gapi.auth2.GoogleUser>
	prepareGoogleSignOutButton(options: {button: HTMLElement}): void
}
