
import {LoginService} from "./login-service"

import {
	MockAuthService,
	MockGoogleMagic,
	MockTokenService
} from "../mocks"

function createMocks() {
	const googleMagic = new MockGoogleMagic()
	const authService = new MockAuthService()
	const tokenService = new MockTokenService()
	const loginService = new LoginService({
		googleMagic,
		authService,
		tokenService
	})

	googleMagic.prepareGoogleSignInButton.mockImplementation(async() => {
		const googleUser = {
			getAuthResponse: jest.fn()
		}
		googleUser.getAuthResponse.mockImplementation(async() => ({
			id_token: "g123"
		}))
		return googleUser
	})

	authService.authenticateWithGoogle.mockImplementation(async() => {
		return {
			accessToken: "a123",
			refreshToken: "r123"
		}
	})

	return {
		googleMagic,
		authService,
		tokenService,
		loginService
	}
}

describe("login service", () => {
	describe("user login routine", () => {

		it("given a google token, return an access token", async() => {
			const {loginService} = createMocks()
			const accessToken = await loginService.userLoginRoutine()
			expect(accessToken).toBeTruthy()
		})

	})
})
