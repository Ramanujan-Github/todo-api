# Todo API

A REST API for a multi-user todo app, with JWT authentication, PostgreSQL, Prisma, and Docker. Each user can only see and change their own todos.

Built while working through [Smoljames' Backend Full Course](https://www.youtube.com/watch?v=9BD9eK9VqXA), developed in stages from an in-memory server to a fully containerized app.

## Tech stack

- **Node.js + Express 5**: server and routing
- **PostgreSQL 17**: database
- **Prisma 6**: ORM and migrations
- **bcryptjs**: password hashing
- **jsonwebtoken**: stateless authentication
- **Docker + Docker Compose**: runs the app and database together

## Running it

You need [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

```bash
git clone https://github.com/Ramanujan-Github/todo-api.git
cd todo-api
cp .env.example .env        # then set JWT_SECRET to a long random string
docker compose up --build
```

The API runs at `http://localhost:7806`. Database migrations are applied automatically on startup.

### Local development

To get hot reload, run only the database in Docker and the app with Node:

```bash
docker compose up -d db
npm install
npx prisma migrate dev
npm run dev
```

## API

All `/todos` routes need an `Authorization: Bearer <token>` header. Get a token from register or login.

### Auth

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `{ "username", "password" }` | `201` `{ token }` · `409` if the username is taken |
| POST | `/auth/login` | `{ "username", "password" }` | `200` `{ token }` · `401` if the credentials are invalid |

### Todos

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/todos` | none | `200` list of your todos |
| GET | `/todos/:id` | none | `200` todo · `404` |
| POST | `/todos` | `{ "task" }` | `201` created todo · `400` if task is missing |
| PUT | `/todos/:id` | `{ "task"?, "done"? }` | `200` updated todo · `404` |
| DELETE | `/todos/:id` | none | `204` · `404` |

A missing or invalid token returns `401`. Asking for another user's todo returns `404`, so the API doesn't reveal that it exists.

`todos.rest` contains ready-to-run requests for the VS Code [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension.

## Project structure

```
todo-api/
├── server.js                 # app setup and route mounting
├── prismaClient.js           # shared Prisma client
├── middleware/
│   └── authMiddleware.js     # verifies the JWT and sets req.userId
├── routes/
│   ├── authRoutes.js         # register and login
│   └── todoRoutes.js         # CRUD, scoped to the logged-in user
├── prisma/
│   ├── schema.prisma         # User and Todo models
│   └── migrations/
├── Dockerfile
└── docker-compose.yml
```

## What I learned

- **Authentication is not authorization.** The middleware proves who you are, but every query still needs `userId` in its filter. Otherwise any logged-in user could change anyone's data by guessing ids.
- **Inside a container, `localhost` means the container itself.** The app reaches Postgres through its Compose service name (`db`), not `localhost`.
- **Migrations instead of deleting the database.** Adding a column to SQLite meant wiping the file. Prisma turns each schema change into a versioned SQL migration.
- **JWTs are signed, not encrypted.** Anyone can read the payload, but nobody can change it without the secret, so it should only hold non-sensitive data like a user id.
