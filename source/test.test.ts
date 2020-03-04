
import {Suite} from "cynic"

import tokenStorageSuite from "./clientside/services/token-storage.test.js"

export default <Suite>{
	"token storage": tokenStorageSuite
}
