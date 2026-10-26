# Upwind Board — Backend

API para que instructores de kitesurf IKO registren sus clases y la progresión de sus alumnos.

NestJS 12 · TypeScript (ESM) · PostgreSQL 17 + TypeORM (con migraciones) · class-validator · Swagger · Vitest

## Requisitos

- Node.js 24+
- Yarn 1.x
- Docker + Docker Compose

## Levantar el entorno

```bash
cd backend
cp .env.example .env          # los valores por defecto coinciden con docker-compose.yml
yarn install
docker compose up -d --wait   # PostgreSQL en localhost:5432
yarn migration:run            # crea el esquema
yarn seed                     # árbol de skills IKO + un instructor de ejemplo
yarn start:dev                # http://localhost:3000
```

La documentación OpenAPI queda en **<http://localhost:3000/docs>** (JSON en `/docs-json`).

Al crearse el contenedor por primera vez, `docker/postgres-init` también crea la base `upwind_board_test`, que usan los tests e2e. Si el volumen ya existía de antes, creala a mano:

```bash
docker exec upwind-board-postgres createdb -U upwind upwind_board_test
```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `yarn start:dev` | API en modo watch |
| `yarn build` / `yarn start:prod` | Compila a `dist/` y lo ejecuta |
| `yarn migration:run` | Aplica las migraciones pendientes |
| `yarn migration:revert` | Revierte la última migración |
| `yarn migration:show` | Lista las migraciones y su estado |
| `yarn migration:check` | Falla si las entidades difieren del esquema que generan las migraciones |
| `yarn typeorm migration:generate src/infrastructure/persistence/type-orm/migrations/<Nombre>` | Genera una migración nueva (después de `yarn build`) |
| `yarn seed` | Seed idempotente (se puede correr las veces que haga falta) |
| `yarn test` | Tests unitarios |
| `yarn test:e2e` | Tests e2e contra `upwind_board_test` (aplican migraciones y truncan las tablas) |
| `yarn lint` / `yarn format` | oxlint / prettier |

Los comandos de migraciones y seed compilan primero y usan `dist/infrastructure/persistence/type-orm/data-source.js`, que lee el `.env`. Las migraciones nuevas se registran en `src/infrastructure/persistence/type-orm/migrations/index.ts`. `synchronize` está siempre desactivado.

## Seed

Los datos están separados de la lógica, en JSON fácil de editar:

- `src/infrastructure/seed/data/iko-skills.json`: árbol IKO (L1 Discovery, L2 Intermediate, L3 Independent y sus habilidades). Cada nodo tiene `code`, `name`, `description` y `children` opcionales; `sortOrder` es opcional (por defecto, la posición ×10).
- `src/infrastructure/seed/data/instructors.json`: instructores de ejemplo.

Reglas del seed:

- Las skills se hacen upsert por `code`: nombre, descripción, padre y orden siguen al archivo; `active` solo se setea al insertar, así que una skill desactivada desde la API sigue desactivada.
- Los instructores se insertan por email y, si ya existen, no se tocan.
- Todo corre en una transacción. Si el archivo le agrega hijos a una skill que ya tiene registros en clases, el seed falla (una skill evaluada tiene que seguir siendo hoja).

## Modelo

`instructors`, `students`, `skills` (árbol autorreferencial por `parent_id`), `lessons`, `lesson_students` y `lesson_skill_records`. Todas las tablas usan ids uuid (`gen_random_uuid()`), `created_at`/`updated_at` y nombres en snake_case.

- **Árbol de skills**: lista de adyacencia que se resuelve con `WITH RECURSIVE`. Al mover una skill se verifica que el nuevo padre no sea ella misma ni un descendiente suyo (además hay un `CHECK` contra `parent_id = id`).
- **Solo las hojas se evalúan**: un registro de una clase solo puede apuntar a una skill sin hijos. Por eso tampoco se le pueden agregar hijos a una skill que ya tiene registros.
- **La progresión no se guarda**: el status actual de cada hoja es el último registrado para ese alumno, ordenando por `lessons.starts_at`. Si dos clases empiezan a la misma hora, gana el registro modificado más recientemente.

## Endpoints

| Recurso | Endpoints |
| --- | --- |
| Instructors | `GET/POST /instructors`, `GET/PATCH/DELETE /instructors/:id` (`?search=&active=&page=&limit=`) |
| Students | `GET/POST /students`, `GET/PATCH/DELETE /students/:id` (`?search=` por nombre, apellido o nombre completo) |
| Skills | `GET /skills/tree` (`?includeInactive=true`), `GET/POST /skills`, `GET/PATCH/DELETE /skills/:id` |
| Lessons | `GET /lessons` (`?instructorId=&studentId=&from=&to=`), `POST /lessons`, `GET/PATCH/DELETE /lessons/:id` |
| Progress | `GET /students/:id/progress`, `GET /students/:id/lessons` |

Los listados están paginados (`page` arranca en 1, `limit` por defecto 20 y máximo 100) y devuelven `{ items, total, page, limit }`.

### Lecciones

`POST /lessons` crea la clase, sus alumnos y los registros de skills en una sola transacción:

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
        { "skillId": "…", "status": "practiced", "notes": "Le cuesta la zona de potencia" }
      ]
    }
  ]
}
```

En `PATCH /lessons/:id` todos los campos son opcionales. Si se envía `students`, es la lista completa de participantes:

- Los alumnos que no aparecen se quitan de la clase, junto con sus registros.
- Los que ya estaban se identifican por `studentId` y conservan su id. Los campos que no se envían mantienen su valor y `null` los borra.
- Si se omite `skillRecords`, se mantienen los registros actuales. Si se envía, reemplaza la lista (los registros de una misma skill conservan su id).

### Progreso

`GET /students/:id/progress` devuelve el árbol de skills; cada hoja trae su `status` actual (`null` si nunca se trabajó), `lastLessonId` y `lastWorkedAt`. Cada nodo trae además un `summary` con los conteos de hojas por estado. También incluye `totalLessons`, `totalMinutes` y `totalHours`. Las skills inactivas solo aparecen si el alumno las trabajó.

### Errores

Todos los errores tienen la misma forma: `{ statusCode, error, message, path, timestamp }`.

- **400**: validación del payload, id mal formado o regla de negocio violada (skill no hoja, ciclo en el árbol, viento mínimo mayor que el máximo, alumno o skill repetidos, instructor inactivo, skill inactiva).
- **404**: el recurso no existe, ya sea en la URL o referenciado en el body.
- **409**: duplicados (email de instructor, código de skill) o borrado de algo que está en uso (instructor o alumno con clases, skill con hijos o con registros).

## Estructura

Arquitectura hexagonal, como define `AGENTS.md`:

```text
src/
  domain/          entidades, enums, errores y puertos de repositorio (clases abstractas)
  application/     casos de uso, DTOs validados y servicios puros (árbol, progresión, merge de lecciones)
  infrastructure/
    config/        validación del .env y opciones de TypeORM
    persistence/type-orm/  entidades ORM, mappers, repositorios, migraciones, data-source del CLI
    rest/          controllers, filtro de errores y setup global (pipes, Swagger)
    modules/       módulos Nest que conectan puertos con adaptadores
    seed/          datos JSON y lógica del seed
test/
  e2e/             tests e2e (supertest) y helpers
  fakes/           repositorio en memoria y fixtures para tests unitarios
```

## Autenticación (pendiente)

Todavía no hay auth. `lessons.instructor_id` ya existe, así que más adelante el instructor autenticado podría salir del token en lugar del body, y se podría filtrar por instructor desde los casos de uso.
