
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
- has an auth endpoint which decodes a googleToken, queries the user database, and returns a signed userToken to the user's browser
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
