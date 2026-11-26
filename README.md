# Upwind Board

Lesson log and IKO progression tracking for kitesurf instructors.

## Monorepo structure

```text
backend/             NestJS API + PostgreSQL (see backend/README.md)
www/                 React app for instructors (see www/README.md)
.github/workflows/   production deploy
```

## Getting started

Requirements: Docker + Docker Compose, and the IAM stack (`../iam`) running locally. Sign-in goes through the IAM; the API reaches it over the external `backend-network` Docker network that both stacks share.

1. Register Upwind Board as an OAuth client in the IAM, with `http://localhost:5000/callback` as its redirect URL, and grant your account permissions on it.
2. Create the env files and fill `IAM_CLIENT_ID` / `IAM_CLIENT_SECRET` in `backend/.env`:

```bash
cp backend/.env.example backend/.env
cp www/.env.example www/.env
docker network create backend-network 2>/dev/null || true   # usually created by the IAM stack
docker compose up --build -d   # migrations create the schema + IKO skill tree + a sample instructor
```

| Service | Container | URL |
| --- | --- | --- |
| Web app | `upwind-board-frontend-container` | <http://localhost:5000> |
| API | `upwind-board-backend-container` | <http://localhost:5001> (OpenAPI at `/docs`) |
| PostgreSQL | `upwind-board-db-container` | `localhost:5434` (`localuser` / `localpassword`) |
| Redis | `upwind-board-cache-container` | `localhost:6381` (sessions) |

The API applies pending migrations every time it starts. Source folders are bind-mounted, so both apps reload on change. The containers run as uid 1000, so the files they generate belong to your user.

Common commands:

```bash
docker compose logs -f upwind-board-server       # follow API logs
docker compose exec upwind-board-server yarn lint
docker compose down                              # stop (add -v to also drop the database)
```

## Production

`docker-compose.prod.yml` builds the production images:

- **API**: multi-stage build that runs pending migrations and then `node dist/main`.
- **Web app**: static build served by nginx.

Both join the external `proxy-network`, where the shared `reverse-proxy` nginx container routes the public domains to `upwind-board-backend-container:5001` and `upwind-board-frontend-container:80`.

The server needs, in `/home/deploy/apps/upwind-board`:

- `.env` with `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB` (see `.env.example`).
- `backend/.env` with the same database credentials, `DB_HOST=upwind-board-db`, `CORS_ORIGINS` set to the web app's public URL, `NODE_ENV=production`, `REDIS_URL=redis://upwind-board-cache:6379` and the IAM settings: its public URL in `IAM_BASE_URL`, the client credentials and `IAM_CALLBACK_URL=<web app URL>/callback` (registered in the IAM).
- `www/.env` with `VITE_API_URL` set to the API's public URL. It is read at build time.

## GitHub Actions

**Deploy** (`deploy.yml`) runs on pushes to `main`. It connects over SSH, pulls and rebuilds only the services whose folder changed (or both, if `docker-compose.prod.yml` changed), reloads the reverse proxy and prunes old images. It needs the `SERVER_HOST`, `SERVER_USER` and `SERVER_SSH_KEY` repository secrets.

## Powered by

NestJS · TypeORM · PostgreSQL · React · Mantine · TanStack Router & Query · Docker
