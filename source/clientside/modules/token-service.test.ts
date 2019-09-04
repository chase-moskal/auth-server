
import {TokenService} from "./token-service"
import {MockAuthService, MockStorage} from "./mocks"

const getTokenServiceWithMocks = () => {
	const storage = new MockStorage()
	const authService = new MockAuthService()
	const tokenService = new TokenService({storage, authService})
	return {tokenService, storage, authService}
}

describe("token service", () => {
	describe("writeTokens()", () => {

		it("stores tokens in storage", async() => {
			const {tokenService, storage} = getTokenServiceWithMocks()
			await tokenService.writeTokens({refreshToken: "r123", accessToken: "a123"})
			expect(storage.setItem.mock.calls).toContainEqual(["refreshToken", "r123"])
			expect(storage.setItem.mock.calls).toContainEqual(["accessToken", "a123"])
		})

	})
	describe("passiveCheck()", () => {

		it("when access token is available, return it", async() => {
			const {tokenService, storage} = getTokenServiceWithMocks()
			storage.getItem.mockImplementation((key: string) => {
				if (key === "refreshToken") return "r123"
				else if (key === "accessToken") return "a123"
			})
			const accessToken = await tokenService.passiveCheck()
			expect(accessToken).toBe("a123")
		})

		it("when access token is missing, use refresh token to get new access token and return it (and save it too)", async() => {
			const {tokenService, storage, authService} = getTokenServiceWithMocks()
			authService.authorize.mockImplementation(async() => "a123")
			storage.getItem.mockImplementation((key: string) => {
				if (key === "refreshToken") return "r123"
				else if (key === "accessToken") return null
			})
			const accessToken = await tokenService.passiveCheck()
			expect(authService.authorize.mock.calls[0][0]).toEqual({refreshToken: "r123"})
			expect(accessToken).toBe("a123")
			expect(storage.setItem).toHaveBeenCalled()
		})

		it("when both acccess token and refresh token are gone, return null", async() => {
			const {tokenService, storage} = getTokenServiceWithMocks()
			storage.getItem.mockImplementation((key: string) => {
				if (key === "refreshToken") return null
				else if (key === "accessToken") return null
			})
			const accessToken = await tokenService.passiveCheck()
			expect(accessToken).toBe(null)
		})

	})
	describe("logout()", () => {

		it("clears the tokens", async() => {
			const {tokenService, storage} = getTokenServiceWithMocks()
			await tokenService.logout()
			expect(storage.removeItem).toHaveBeenCalledTimes(2)
		})

	})
})
