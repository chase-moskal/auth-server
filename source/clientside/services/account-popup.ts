
import {
	AccessToken,
	TokenStorageTopic,
	AccountPopupTopic,
	AuthExchangerTopic
} from "authoritarian"

import {GoogleMagicInterface} from "../interfaces"

export class AccountPopup implements AccountPopupTopic {
	private _tokenStorage: TokenStorageTopic
	private _authExchanger: AuthExchangerTopic
	private _googleMagic: GoogleMagicInterface

	constructor(options: {
		tokenStorage: TokenStorageTopic
		authExchanger: AuthExchangerTopic
		googleMagic: GoogleMagicInterface
	}) {
		this._googleMagic = options.googleMagic
		this._tokenStorage = options.tokenStorage
		this._authExchanger = options.authExchanger
	}

	async login(): Promise<AccessToken> {
		await this._googleMagic.initGoogleAuth()
		this._googleMagic.prepareGoogleSignOutButton({
			button: document.querySelector<HTMLDivElement>("#google-signout")
		})
		const tokens = await this._auth()
		await this._tokenStorage.writeTokens(tokens)
		return tokens.accessToken
	}

	/**
	 * Authenticate with google
	 */
	private async _auth() {
		const googleUser = await this._googleMagic.prepareGoogleSignInButton()
		const googleToken = googleUser.getAuthResponse().id_token
		console.log("googleToken", googleToken)
		const tokens = await this._authExchanger.authenticateViaGoogle({googleToken})
		return tokens
	}
}
