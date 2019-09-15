
import {
	AuthTokens,
	TokenStorageTopic,
	AccountPopupTopic,
	AuthExchangerTopic,
} from "authoritarian/dist/interfaces"

import {GoogleAuthClientInterface} from "../interfaces"

export class AccountPopup implements AccountPopupTopic {
	private _tokenStorage: TokenStorageTopic
	private _authExchanger: AuthExchangerTopic
	private _googleAuthClient: GoogleAuthClientInterface

	constructor(options: {
		tokenStorage: TokenStorageTopic
		authExchanger: AuthExchangerTopic
		googleAuthClient: GoogleAuthClientInterface
	}) {
		this._googleAuthClient = options.googleAuthClient
		this._tokenStorage = options.tokenStorage
		this._authExchanger = options.authExchanger
	}

	async login(): Promise<AuthTokens> {
		await this._googleAuthClient.initGoogleAuth()
		this._googleAuthClient.prepareGoogleSignOutButton({
			button: document.querySelector<HTMLDivElement>("#google-signout")
		})
		const tokens = await this._auth()
		await this._tokenStorage.writeTokens(tokens)
		console.log("USER LOGIN ROUTINE COMPLETE", tokens)
		return tokens
	}

	/**
	 * Authenticate with google
	 */
	private async _auth() {
		const googleUser = await this._googleAuthClient.prepareGoogleSignInButton()
		const googleToken = googleUser.getAuthResponse().id_token
		console.log("googleToken", googleToken)
		const tokens = await this._authExchanger.authenticateViaGoogle({googleToken})
		return tokens
	}
}
