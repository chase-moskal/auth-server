
export interface User {
	id: number
	googleId: string
	name: string
	email: string
	nickname: string
}

export type QueryUserByGoogleId = (options: {googleId: string}) => Promise<User>
