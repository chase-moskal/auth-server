
import {
	colors,
	animals,
	adjectives,
	uniqueNamesGenerator,
} from "unique-names-generator"

export function generateName() {
	return uniqueNamesGenerator({dictionaries: [adjectives, colors, animals]})
}
