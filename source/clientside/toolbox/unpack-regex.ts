
import {JsonRegex} from "../interfaces"

export const unpackRegex = (json: JsonRegex) => json
	? new RegExp(json.pattern, json.flags)
	: null
