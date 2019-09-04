
import {AuthTopic} from "authoritarian"

export class MockStorage implements Storage {
	getItem = jest.fn()
	setItem = jest.fn()
	removeItem = jest.fn()
	clear = jest.fn()
	length = null
	key = null
}

export class MockAuthService implements AuthTopic {
	authorize = jest.fn()
	authenticateWithGoogle = jest.fn()
}
