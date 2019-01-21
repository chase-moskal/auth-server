
### Authoritarian overview

Authentication and authorization solution for microservices and the web

- [`authoritarian`](https://github.com/chase-moskal/authoritarian#authoritarian-overview) – node library for auth and user management
- [`authoritarian-client`](https://github.com/chase-moskal/authoritarian-client#authoritarian-overview) – browser ui library for login and user settings
- ***[`auth-server`](https://github.com/chase-moskal/auth-server`#authoritarian-overview) (you are here)*** – example standalone auth server
- [`auth-webapp`](https://github.com/chase-moskal/auth-webapp#authoritarian-overview) – example microservice and frontend

---

# Auth Server

- node auth server using `authoritarian` library
- conforms to google's oauth workflow to enable google sign-in
- has an auth endpoint which decodes a googleToken, queries the user database, and returns a signed userToken to the user's browser.  
	the user can now make api requests which can be validated by any api which shares the secret key
- user public data is encoded in the userToken
- user can update some of their data
- user can interact with braintree to gain priviledges to paywall content

## `config.json`

```json
{
	"authServer": {
		"port": 80,
		"secrets": {
			"authKey": "~/auth-server/hs256.key"
		},
		"allowedOrigins": [
			"chasemoskal.com"
		]
	},
	"mongoDb": {
		"name": "auth",
		"host": "database.chasemoskal.com",
		"port": 27017,
		"username": "auth-server",
		"password": "123"
	}
}
```

## notes about google auth

### frontend work

https://developers.google.com/identity/sign-in/web/sign-in

1. load gapi `<script src="https://apis.google.com/js/platform.js" async defer></script>`

1. specify app's client id `<meta name="google-signin-client_id" content="YOUR_CLIENT_ID.apps.googleusercontent.com">`

1. google sign in button `<div class="g-signin2" data-onsuccess="onSignIn"></div>`

1. onSignIn function handles successful signin

	```js
	function onSignIn(googleUser) {
		var profile = googleUser.getBasicProfile();
		console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
		console.log('Name: ' + profile.getName());
		console.log('Image URL: ' + profile.getImageUrl());
		console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
	}
	```

	send the google id token to the backend

	```js
	function onSignIn(googleUser) {
		var id_token = googleUser.getAuthResponse().id_token;

		var xhr = new XMLHttpRequest();
		xhr.open('POST', 'https://yourbackend.example.com/tokensignin');
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.onload = function() {
			console.log('Signed in as: ' + xhr.responseText);
		};
		xhr.send('idtoken=' + id_token);
	}
	```

1. handle sign-out

	```html
	<a href="#" onclick="signOut();">Sign out</a>
	<script>
		function signOut() {
			var auth2 = gapi.auth2.getAuthInstance();
			auth2.signOut().then(function () {
				console.log('User signed out.');
			});
		}
	</script>
	```

	send signal to backend to sign out

### backend work

1. verify google id tokens

	`npm install google-auth-library`

	```js
	const {OAuth2Client} = require('google-auth-library');
	const client = new OAuth2Client(CLIENT_ID);
	async function verify() {
		const ticket = await client.verifyIdToken({
				idToken: token,
				audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
				// Or, if multiple clients access the backend:
				//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
		});
		const payload = ticket.getPayload();
		const userid = payload['sub'];
		// If request specified a G Suite domain:
		//const domain = payload['hd'];
	}
	verify().catch(console.error);
	```

1. create our own backend user account
