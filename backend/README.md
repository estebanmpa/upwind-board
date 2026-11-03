# Upwind Board — Backend

API for IKO kitesurf instructors to log their lessons and track their students' progression.

NestJS 12 · TypeScript (ESM) · PostgreSQL 17 + TypeORM (with migrations) · class-validator · Swagger

## Requirements

- Node.js 24+
- Yarn 1.x
- Docker + Docker Compose

## Getting started

The whole stack (API, web app and PostgreSQL) runs with Docker from the repository root; see the [root README](../README.md):

```bash
cp backend/.env.example backend/.env
docker compose up --build -d
docker compose exec upwind-board-server yarn migration:run   # schema + IKO skill tree + a sample instructor
```

The API listens on <http://localhost:5001> and the OpenAPI docs are served at **<http://localhost:5001/docs>** (JSON at `/docs-json`).

Run the scripts below inside the container (`docker compose exec upwind-board-server yarn <script>`). To run them on the host instead, set `DB_HOST=localhost` and `DB_PORT=5434` in `.env`.

### Environment variables

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port (5001) |
| `CORS_ORIGINS` | Comma-separated origins allowed to call the API. Empty disables CORS (local development goes through the Vite proxy) |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL connection |
| `DB_LOGGING` | Log SQL queries (`true`/`false`) |

## Scripts

| Command | What it does |
| --- | --- |
| `yarn start:dev` | API in watch mode |
| `yarn build` / `yarn start:prod` | Compiles to `dist/` and runs it |
| `yarn migration:run:prod` | Applies pending migrations from an existing build (run manually in the production container) |
| `yarn migration:run` | Applies pending migrations |
| `yarn migration:revert` | Reverts the last migration |
| `yarn migration:show` | Lists migrations and their status |
| `yarn migration:check` | Fails if the entities differ from the schema the migrations produce |
| `yarn typeorm migration:generate src/infrastructure/persistence/type-orm/migrations/<Name>` | Generates a new migration (after `yarn build`) |
| `yarn lint` / `yarn format` | oxlint / prettier |
| `yarn test` | Unit tests (Vitest) |

The migration commands build first and use `dist/infrastructure/persistence/type-orm/data-source.js`, which reads `.env`. New migrations must be registered in `src/infrastructure/persistence/type-orm/migrations/index.ts`. `synchronize` and `migrationsRun` are always disabled and no container applies migrations on start: they always run manually.

## Initial data

`1793016000000-InitialSchema.ts` creates the schema and `1793016000001-SeedInitialData.ts` inserts the initial data with plain SQL `INSERT` statements: the IKO skill tree (levels → skills → sub-skills, each child resolving its `parent_id` by `code`) and a sample instructor. Later data changes must go in a new migration.

## Data model

`instructors`, `students`, `skills` (self-referencing tree through `parent_id`), `lessons`, `lesson_students`, `lesson_skill_records`, `equipment` and `lesson_equipment`. Every table uses uuid ids (`gen_random_uuid()`), `created_at`/`updated_at` and snake_case names.

- **Skill tree**: an adjacency list resolved with `WITH RECURSIVE`. When a skill is moved, the service checks that the new parent is neither the skill itself nor one of its descendants (there is also a `CHECK` against `parent_id = id`).
- **Only leaves are evaluated**: a lesson record can only point to a skill without children. For the same reason, a skill that already has records cannot get children.
- **Equipment**: the school inventory (`type`: kite, board, bar, harness, wetsuit, impact_vest, helmet, radio, other; `status`: available, maintenance, retired). A lesson can optionally reference any number of items through `lesson_equipment`. Only `available` items can be newly assigned, and the same item cannot be in two lessons whose time windows (`starts_at` + `duration_minutes`) overlap.
- **Progression is not stored**: each leaf's current status is the latest one recorded for that student, ordered by `lessons.starts_at`. If two lessons start at the same time, the most recently modified record wins.

## Endpoints

| Resource | Endpoints |
| --- | --- |
| Instructors | `GET/POST /instructors`, `GET/PATCH/DELETE /instructors/:id` (`?search=&active=&page=&limit=`) |
| Students | `GET/POST /students`, `GET/PATCH/DELETE /students/:id` (`?search=` by first, last or full name) |
| Skills | `GET /skills/tree` (`?includeInactive=true`), `GET/POST /skills`, `GET/PATCH/DELETE /skills/:id` |
| Lessons | `GET /lessons` (`?instructorId=&studentId=&from=&to=`), `POST /lessons`, `GET/PATCH/DELETE /lessons/:id` |
| Equipment | `GET/POST /equipment`, `GET/PATCH/DELETE /equipment/:id` (`?search=&type=&status=&page=&limit=`) |
| Progress | `GET /students/:id/progress`, `GET /students/:id/lessons` |

Lists are paginated (`page` starts at 1, `limit` defaults to 20 with a maximum of 100) and return `{ items, total, page, limit }`.

### Lessons

`POST /lessons` creates the lesson, its students and their skill records in a single transaction:

```json
{
  "instructorId": "…",
  "startsAt": "2026-11-02T15:00:00-03:00",
  "durationMinutes": 120,
  "spot": "Punta Lara",
  "windDirection": "NO",
  "windMinKnots": 14,
  "windMaxKnots": 18,
  "students": [
    {
      "studentId": "…",
      "kiteSizeM2": 9,
      "board": "Twin tip 138",
      "skillRecords": [
        { "skillId": "…", "status": "practiced", "notes": "Struggles with the power zone" }
      ]
    }
  ],
  "equipmentIds": ["…"]
}
```

`startsAt` must include a timezone offset, and `windDirection` uses the 16-point compass with English initials (`N`, `NNE` … `W` … `NW`, `NNW`).

In `PATCH /lessons/:id` every field is optional. When `students` is sent, it is the full list of participants:

- Students missing from it are removed from the lesson, together with their records.
- Students already in the lesson are matched by `studentId` and keep their id. Fields that are not sent keep their value; `null` clears them.
- Omitting `skillRecords` keeps the current records. Sending it replaces the list (records for the same skill keep their id).

`equipmentIds` is optional. In `PATCH`, omitting it keeps the assigned equipment and sending it replaces the list. Equipment that went to maintenance or was retired can stay on lessons that already had it.

Responses from `/lessons` also include, for display only, the instructor's name (`instructor: { id, firstName, lastName }`) and each student's name (`students[].student`) and the assigned equipment (`equipment: [{ id, name, type, size }]`). They are ignored in `POST`/`PATCH` bodies.

### Progress

`GET /students/:id/progress` returns the skill tree. Each leaf carries its current `status` (`null` if never worked on), `lastLessonId` and `lastWorkedAt`, and every node has a `summary` with leaf counts per status. The response also includes `totalLessons`, `totalMinutes` and `totalHours`. Inactive skills only appear if the student worked on them.

### Errors

Every error has the same shape: `{ statusCode, error, message, path, timestamp }`.

- **400**: payload validation, malformed id, or a broken business rule (non-leaf skill, cycle in the tree, minimum wind above maximum, repeated student, skill or equipment, inactive instructor, inactive skill, unavailable or double-booked equipment).
- **404**: the resource does not exist, whether it comes from the URL or is referenced in the body.
- **409**: duplicates (instructor email, skill code, equipment serial number) or deleting something in use (instructor, student or equipment with lessons, skill with children or records).

## Project structure

Hexagonal architecture, as defined in `AGENTS.md`:

```text
src/
  domain/          entities, enums, errors and repository ports (abstract classes)
  application/     use cases, validated DTOs and pure services (tree, progression, lesson merge)
  infrastructure/
    config/        .env validation and TypeORM options
    persistence/type-orm/  ORM entities, mappers, repositories, migrations, CLI data source
    rest/          controllers, error filter and global setup (pipes, Swagger)
    modules/       Nest modules wiring ports to adapters
```

## Authentication (pending)

There is no auth yet. `lessons.instructor_id` already exists, so later the authenticated instructor could come from the token instead of the body, and the use cases could filter by instructor.
