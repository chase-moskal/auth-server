
import {JsonRegex} from "../interfaces.js"

export const unpackRegex = (json: JsonRegex) => json
	? new RegExp(json.pattern, json.flags)
	: null
