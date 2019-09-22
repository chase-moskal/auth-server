
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

	async getPublicProfile({userId}) {
		return {
			userId,
			public: {
				picture: "fake-picture",
				nickname: "fake-chaser3275",
			}
		}
	}

	async getFullProfile({accessToken, userId}) {
		return {
			userId,
			public: {
				picture: "fake-picture",
				nickname: "fake-chaser3275",
			},
			private: {
				realname: "Fake Chase Moskal",
			}
		}
	}

	async setFullProfile({accessToken, profile}) {
		return null
	}
}
