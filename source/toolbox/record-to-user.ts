
import {UserRecord} from "../interfaces.js"
import {User} from "authoritarian/dist/interfaces.js"

export const recordToUser = ({_id, claims}: UserRecord): User => ({
	claims,
	userId: _id.toHexString(),
})
