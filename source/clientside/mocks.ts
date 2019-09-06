
import {GoogleMagicInterface} from "./interfaces"
import {AuthTopic, TokenTopic} from "authoritarian"

export class MockStorage implements Storage {
	key = null
	length = null
	clear = jest.fn()
	getItem = jest.fn()
	setItem = jest.fn()
	removeItem = jest.fn()
}

export class MockAuthService implements AuthTopic {
	authorize = jest.fn()
	authenticateWithGoogle = jest.fn()
}

export class MockTokenService implements TokenTopic {
	logout = jest.fn()
	writeTokens = jest.fn()
	passiveCheck = jest.fn()
}

export class MockGoogleMagic implements GoogleMagicInterface {
	initGoogleAuth = jest.fn()
	prepareGoogleSignInButton = jest.fn()
	prepareGoogleSignOutButton = jest.fn()
}
