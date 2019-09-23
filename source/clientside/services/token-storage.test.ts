
import {TokenStorage} from "./token-storage"
import {MockAuthExchanger, MockStorage} from "../mocks"

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
	xdescribe("passiveCheck()", () => {

		it("when access token is available, return it", async() => {
			const {tokenStorage, storage} = makeMocks()
			storage.getItem.mockImplementation((key: string) => {
				if (key === "refreshToken") return "r123"
				else if (key === "accessToken") return "a123"
			})
			const accessToken = await tokenStorage.passiveCheck()
			expect(accessToken).toBe("a123")
		})

		it("when access token is missing, use refresh token to get new access token and return it (and save it too)", async() => {
			const {tokenStorage, storage, authExchanger} = makeMocks()
			authExchanger.authorize.mockImplementation(async() => "a123")
			storage.getItem.mockImplementation((key: string) => {
				if (key === "refreshToken") return "r123"
				else if (key === "accessToken") return null
			})
			const accessToken = await tokenStorage.passiveCheck()
			expect(authExchanger.authorize.mock.calls[0][0]).toEqual({refreshToken: "r123"})
			expect(accessToken).toBe("a123")
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
