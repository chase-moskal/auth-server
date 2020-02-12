
import {AuthExchangerTopic, TokenStorageTopic}
	from "authoritarian/dist/interfaces.js"

import {GoogleAuthClientInterface} from "./interfaces.js"

export class MockStorage implements Storage {
	key = null
	length = null
	clear = jest.fn()
	getItem = jest.fn()
	setItem = jest.fn()
	removeItem = jest.fn()
}

export class MockAuthExchanger implements AuthExchangerTopic {
	authorize = jest.fn()
	authenticateViaGoogle = jest.fn()
}

export class MockTokenStorage implements TokenStorageTopic {
	clearTokens = jest.fn()
	writeTokens = jest.fn()
	passiveCheck = jest.fn()
	writeAccessToken = jest.fn()
}

export class MockGoogleAuthClient implements GoogleAuthClientInterface {
	initGoogleAuth = jest.fn()
	prepareGoogleSignInButton = jest.fn()
	prepareGoogleSignOutButton = jest.fn()
}
