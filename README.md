# Framework Programming GIN + GORM

REST API boilerplate built with [Gin](https://github.com/gin-gonic/gin) and [GORM](https://gorm.io/) that demonstrates user authentication with JWT and CRUD operations for blog posts.

## Features

- JSON Web Token (JWT) authentication with cookie storage
- User registration and login with bcrypt password hashing
- Protected routes that hydrate the authenticated user from the token
- Blog post CRUD (create, read, update, soft delete, hard delete) backed by MySQL
- Database migrations via `gorm.DB.AutoMigrate`

## Tech Stack

- Go 1.24
- Gin Web Framework
- GORM ORM
- MySQL (via `gorm.io/driver/mysql`)

## Key Dependencies

- [godotenv](https://github.com/joho/godotenv): load environment variables from a `.env` file during development
- [Gin](https://gin-gonic.com/): high-performance HTTP web framework for Go
- [GORM](https://gorm.io/): developer-friendly ORM for Go with rich database features

## Installation

1. Ensure you have Go 1.24 installed: `go version`
2. Clone the repository and enter the project folder:

```bash
git clone https://github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM.git
cd Framework-Programming-GIN-GORM
```

3. Pull core dependencies explicitly (optional when using `go mod tidy`, but useful for first-time setup):

```bash
go get github.com/joho/godotenv
go get github.com/gin-gonic/gin
go get gorm.io/gorm
go get gorm.io/driver/mysql
```

4. Download remaining module requirements:

```bash
go mod tidy
```

5. Follow the sections below to configure environment variables, run migrations, and start the server.

## Getting Started

### Prerequisites

- Go 1.24 or newer
- MySQL instance (local or remote)

### Environment Variables

Create a `.env` file in the project root with at least the following values:

```
DB_URL="user:password@tcp(localhost:3306)/dbname?parseTime=true"
JWT_SECRET="your-jwt-secret"
ENV="development"
```

`JWT_SECRET` is used to sign and verify JWT tokens. `ENV` is optional and only toggles the secure flag on cookies when set to `production`.

### Run Database Migrations

Ensure the database specified in `DB_URL` exists. Then run:

```bash
go run migrate/Migrate.go
```

This will auto-migrate the `models.Blog` and `models.User` schemas.

### Start the Server

```bash
go run main.go
```

By default Gin listens on `http://localhost:8080`.

## Usage

1. **Sign up** a user via `POST /signup` with `name`, `email`, and `password`.
2. **Sign in** via `POST /signin`. On success the JWT is set in an HttpOnly cookie named `token` and also returned in the JSON body. The token expiry is currently configured for 5 seconds for demonstration purposes; adjust in `controllers/AuthController.go` as needed.
3. Blog CRUD endpoints are public and do not require authentication. Only the example protected endpoints require authentication:

- `GET /protected/profile`
- `GET /profile2`

## API Reference

| Method | Route                | Auth | Description                             |
| ------ | -------------------- | ---- | --------------------------------------- |
| POST   | `/signup`            | No   | Create a new user                       |
| POST   | `/signin`            | No   | Sign in, receive JWT cookie and token   |
| POST   | `/blog`              | No   | Create a blog post                      |
| GET    | `/blogs`             | No   | List all blog posts                     |
| GET    | `/blogs/:id`         | No   | Get a blog post by ID                   |
| PUT    | `/blogs/:id`         | No   | Update a blog post                      |
| DELETE | `/blogs/:id`         | No   | Soft delete a blog post                 |
| DELETE | `/blogs/:id/hard`    | No   | Permanently delete a blog post          |
| GET    | `/protected/profile` | Yes  | Retrieve authenticated user profile     |
| GET    | `/profile2`          | Yes  | Profile example using `AuthMiddleware2` |

### Request Samples

Create blog post:

```http
POST /blog
Content-Type: application/json

{
  "title": "Hello Gin",
  "content": "Building REST APIs with Gin and GORM."
}
```

### Error Handling

Responses follow a simple JSON structure on error:

```json
{
  "error": "message"
}
```

## Development Notes

- Database connection is configured in `initializers/ConnectToDB.go` using the `DB_URL` DSN.
- Middleware in `middleware/AuthMiddleware.go` validates JWTs, loads the `models.User`, and stores it in the Gin context under the `user` key.
- `migrate/Migrate.go` can be extended with additional models as the domain grows.
- Token lifetime defaults to 5 seconds in `controllers/AuthController.go` for easy expiration testing; adjust `time.Now().Add(5 * time.Second)` for production use.

## Troubleshooting

- **`failed to connect to database`**: verify `DB_URL` points to an accessible MySQL instance and that the database exists.
- **`Authorization cookie required`**: ensure you include the `token` cookie returned from `/signin` when calling protected routes.

## License

No license information has been provided. Add one if you plan to distribute or open-source this project.

## Testing with Postman

Below are simple steps to test the API using Postman. You can either let Postman manage cookies (recommended) or use the JWT returned by `/signin` as a Bearer token.

1. Create an environment variable in Postman named `baseUrl` with value `http://localhost:8080` (or your server URL).

2. Sign up a new user
  - Method: POST
  - URL: `{{baseUrl}}/signup`
  - Body (JSON):

```json
{
  "name": "Your Name",
  "email": "you@example.com",
  "password": "secret"
}
```

3. Sign in
  - Method: POST
  - URL: `{{baseUrl}}/signin`
  - Body (JSON):

```json
{
  "email": "you@example.com",
  "password": "secret"
}
```

  - Response: the server sets an HttpOnly cookie named `token` (Postman will store this cookie automatically if you use the same domain) and returns the token in the JSON body as `token`.

4. Using cookies (recommended)
  - After a successful `/signin`, Postman stores the `token` cookie for `localhost`. When you send subsequent requests to the same `{{baseUrl}}`, Postman will include the cookie automatically. If cookies are not being sent, open Postman's Cookies (Cookies Manager) and confirm `token` exists for the `localhost` domain.

5. Using the token as Authorization header (alternative)
  - Copy the `token` value from the `/signin` JSON response.
  - For protected requests (e.g. `GET {{baseUrl}}/protected/profile`), add a header:

```
Authorization: Bearer <token>
```

  - Note: The project prefers cookie-based auth. Authorization header support is only available if you modify the middleware to accept `Authorization` header.

6. Example: create a blog post (no auth required)
  - Method: POST
  - URL: `{{baseUrl}}/blog`
  - Body (JSON):

```json
{
  "title": "Postman Test",
  "content": "Testing the API with Postman"
}
```

7. Troubleshooting with Postman
  - If you receive `Authorization cookie required`, verify that Postman stored and is sending the `token` cookie for `localhost`.
  - If you used the Bearer header and receive `Invalid token`, ensure the token is exactly as returned by `/signin` and not wrapped or truncated.

If you'd like, I can generate a Postman collection (JSON) for these requests and add it to the repo so you can import it directly.
