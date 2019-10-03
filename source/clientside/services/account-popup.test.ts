
import {AccountPopup} from "./account-popup"

import {
	MockAuthExchanger,
	MockGoogleAuthClient,
	MockTokenStorage
} from "../jest-mocks"

function makeMocks() {
	const googleAuthClient = new MockGoogleAuthClient()
	const authExchanger = new MockAuthExchanger()
	const tokenStorage = new MockTokenStorage()
	const accountPopup = new AccountPopup({
		googleAuthClient,
		authExchanger,
		tokenStorage
	})

	googleAuthClient.prepareGoogleSignInButton.mockImplementation(async() => {
		const googleUser = {
			getAuthResponse: jest.fn()
		}
		googleUser.getAuthResponse.mockImplementation(async() => ({
			id_token: "g123"
		}))
		return googleUser
	})

	authExchanger.authenticateViaGoogle.mockImplementation(async() => {
		return {
			accessToken: "a123",
			refreshToken: "r123"
		}
	})

	return {
		googleAuthClient,
		accountPopup,
		tokenStorage,
		authExchanger
	}
}

describe("account popup", () => {
	describe("login", () => {

		it("given a google token, return an access token", async() => {
			const {accountPopup} = makeMocks()
			const accessToken = await accountPopup.login()
			expect(accessToken).toBeTruthy()
		})

	})
})
