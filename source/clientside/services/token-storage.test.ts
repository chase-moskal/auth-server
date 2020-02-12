
import {TokenStorage} from "./token-storage.js"
import {
	createMockAccessToken,
	createMockRefreshToken,
} from "../../mocks"
import {
	MockStorage,
	MockAuthExchanger,
} from "../jest-mocks"

const makeMocks = () => {
	const storage = new MockStorage()
	const authExchanger = new MockAuthExchanger()
	const tokenStorage = new TokenStorage({storage, authExchanger})
	return {tokenStorage, storage, authExchanger}
}

describe("token storage", () => {
	describe("writeTokens()", () => {

		it("stores tokens in storage", async() => {
			const {tokenStorage, storage} = makeMocks()
			await tokenStorage.writeTokens({refreshToken: "r123", accessToken: "a123"})
			expect(storage.setItem.mock.calls).toContainEqual(["refreshToken", "r123"])
			expect(storage.setItem.mock.calls).toContainEqual(["accessToken", "a123"])
		})

	})
	describe("passiveCheck()", () => {

		it("when access token is available, return it", async() => {
			const {tokenStorage, storage} = makeMocks()
			const mockAccessToken = await createMockAccessToken({expiresMilliseconds: 10 * (60 * 1000)})
			const mockRefreshToken = await createMockRefreshToken({expiresMilliseconds: 10 * (60 * 1000)})
			storage.getItem.mockImplementation((key: string) => {
				if (key === "refreshToken") return mockRefreshToken
				else if (key === "accessToken") return mockAccessToken
			})
			const accessToken = await tokenStorage.passiveCheck()
			expect(accessToken).toBe(mockAccessToken)
		})

		it("when access token is missing, use refresh token to get new access token and return it (and save it too)", async() => {
			const {tokenStorage, storage, authExchanger} = makeMocks()
			const mockAccessToken = await createMockAccessToken({expiresMilliseconds: 10 * (60 * 1000)})
			const mockRefreshToken = await createMockRefreshToken({expiresMilliseconds: 10 * (60 * 1000)})
			authExchanger.authorize.mockImplementation(async() => mockAccessToken)
			storage.getItem.mockImplementation((key: string) => {
				if (key === "refreshToken") return mockRefreshToken
				else if (key === "accessToken") return null
			})
			const accessToken = await tokenStorage.passiveCheck()
			expect(authExchanger.authorize.mock.calls[0][0]).toEqual({refreshToken: mockRefreshToken})
			expect(accessToken).toBe(mockAccessToken)
			expect(storage.setItem).toHaveBeenCalled()
		})

		it("when both acccess token and refresh token are gone, return null", async() => {
			const {tokenStorage, storage} = makeMocks()
			storage.getItem.mockImplementation((key: string) => {
				if (key === "refreshToken") return null
				else if (key === "accessToken") return null
			})
			const accessToken = await tokenStorage.passiveCheck()
			expect(accessToken).toBe(null)
		})

	})
	describe("clearTokens()", () => {

		it("tokens are no longer accessible", async() => {
			const {tokenStorage, storage} = makeMocks()
			await tokenStorage.clearTokens()
			expect(storage.removeItem).toHaveBeenCalledTimes(2)
		})

	})
})
