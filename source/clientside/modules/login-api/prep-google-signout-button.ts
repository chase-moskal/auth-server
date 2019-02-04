
import {GoogleAuthFixed} from "../../interfaces"

/**
 * Prepare the sign-out button functionality
 * - keep style display updated
 * - sign-out on click
 */
export function prepGoogleSignOutButton({button, googleAuth}: {
	button: HTMLElement
	googleAuth: GoogleAuthFixed
}) {
	const updateLogoutButton = (isSignedIn: boolean) =>
		button.style.display = isSignedIn
			? "block"
			: "none"
	updateLogoutButton(googleAuth.isSignedIn.get())
	googleAuth.isSignedIn.listen(updateLogoutButton)
	button.onclick = () => googleAuth.signOut()
}
