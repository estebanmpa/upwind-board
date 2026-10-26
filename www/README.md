# Upwind Board — Frontend

App for IKO instructors to log lessons, follow each student's progression and manage the skill tree.

Vite · React 19 · Mantine 7 · TanStack Router (file-based routes) · TanStack Query · React Hook Form + Zod

## Getting started

The backend must be running (see `../backend/README.md`) with migrations and seed applied.

```bash
cd www
cp .env.example .env
yarn install
yarn dev            # http://localhost:5173
```

In development, Vite forwards `/api/*` to the backend (`VITE_API_PROXY_TARGET`, `http://localhost:3000` by default), so CORS is not needed. To point a build at another URL, set `VITE_API_URL`.

| Command | What it does |
| --- | --- |
| `yarn dev` | Development server |
| `yarn build` | Typecheck + production build in `dist/` |
| `yarn preview` | Serves the production build |
| `yarn format` | Prettier |

## Screens

| Route | Content |
| --- | --- |
| `/` | Dashboard: lessons and hours this month, students, active instructors and latest lessons |
| `/clases` | Paginated lesson list, filterable by instructor |
| `/clases/nueva` | Log a lesson (`?studentId=` adds that student upfront) |
| `/clases/:id` | Edit or delete a lesson |
| `/alumnos` | Student list with search by name |
| `/alumnos/:id` | Profile: IKO progression per level, lesson history and student details |
| `/alumnos/nuevo`, `/alumnos/:id/editar` | Create and edit students |
| `/instructores`, `/instructores/nuevo`, `/instructores/:id` | Instructor management |
| `/habilidades` | IKO tree: create, edit, move, deactivate and delete skills |

Routes and UI copy are in Spanish, the language of the app's users.

When logging a lesson, each student gets a card with kite, board, notes and a per-level editor where each skill is marked as Introduced, Practiced or Mastered. Next to every skill, the editor shows the last status recorded for that student. Inactive skills only show up if the lesson already recorded them.

## Project structure

```text
src/
  api/          HTTP client (ApiError) and per-resource functions
  queries/      TanStack Query queryOptions and query keys
  mutations/    mutation hooks that invalidate the affected queries
  schemas/      Zod form schemas
  types/        API types and constants (statuses, wind directions)
  utils/        pure logic: formatting, skill tree, progress, lesson payload building
  hooks/        reusable hooks (paged search, delete confirmation)
  components/   UI by domain (layout, common, lessons, students, skills, instructors)
  pages/        one page per screen
  routes/       TanStack Router routes (thin: loader + page)
  theme/        Mantine theme and global styles (glassmorphism, animations)
```

Every screen hangs from `routes/_authenticated.tsx`, which currently lets everyone through. The session check will go in its `beforeLoad` once auth exists. There is no `_public.tsx` yet because there are no public screens (such as a login page).
