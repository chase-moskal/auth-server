
import {TokenService} from "./token-service"

class MockStorage implements Storage {
	getItem = jest.fn()
	setItem = jest.fn()
	removeItem = jest.fn()
	clear = jest.fn()
	length = null
	key = null
}

function createMocks() {
	const mockStorage = new MockStorage()
	const tokenService = new TokenService({storage: mockStorage})
	return {mockStorage, tokenService}
}

describe("token service", () => {

	describe("writeTokens()", () => {
		it("stores tokens in storage", async() => {
			const {tokenService, mockStorage} = createMocks()
			await tokenService.writeTokens({refreshToken: "r123", accessToken: "a123"})
			expect(mockStorage.setItem.mock.calls).toContainEqual(["refreshToken", "r123"])
			expect(mockStorage.setItem.mock.calls).toContainEqual(["accessToken", "a123"])
		})
	})

	describe("passiveCheck()", () => {
		xit("when access token is available, return it", async() => {})
		xit("when acccess token is missing, use refresh token to get new access token and return it", async() => {})
		xit("when acccess token and refresh token are both gone, return null", async() => {})
	})

	describe("logout()", () => {
		it("clears the tokens", async() => {
			const {tokenService, mockStorage} = createMocks()
			await tokenService.logout()
			expect(mockStorage.removeItem).toHaveBeenCalledTimes(2)
		})
	})
})
