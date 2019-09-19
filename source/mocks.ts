
import {ClaimsVanguardTopic, ProfilerTopic} from "authoritarian/dist/cjs/interfaces"

export class MockClaimsVanguard implements ClaimsVanguardTopic {

	async createUser({googleId}) {
		return {
			userId: "fake-user-id",
			claims: {},
		}
	}

	async getUser({userId}) {
		return {
			userId: "fake-user-id",
			claims: {}
		}
	}

	async setClaims({userId, claims}) {
		return {
			userId: "fake-user-id",
			claims
		}
	}
}

export class MockProfiler implements ProfilerTopic {

	async setProfile({accessToken, profile}) {
		return null
	}

	async getProfile({accessToken, userId}) {
		return {
			userId,
			picture: "fake-picture",
			realname: "Fake Chase Moskal",
			nickname: "fake-chaser3275",
		}
	}
}
