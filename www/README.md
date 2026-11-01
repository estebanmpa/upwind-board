# Upwind Board — Frontend

App for IKO instructors to log lessons, follow each student's progression and manage the skill tree.

Vite · React 19 · Mantine 7 · TanStack Router (file-based routes) · TanStack Query · React Hook Form + Zod

## Getting started

The app runs with Docker from the repository root together with the API; see the [root README](../README.md):

```bash
cp www/.env.example www/.env
docker compose up --build -d   # http://localhost:5000
```

In development, Vite forwards `/api/*` to the API (`VITE_API_PROXY_TARGET`, `http://upwind-board-server:5001` inside Docker), so CORS is not needed. Running `yarn dev` on the host instead? Set `VITE_API_PROXY_TARGET=http://localhost:5001`.

Production builds call the API directly at `VITE_API_URL` (read from `.env` at build time) and are served by nginx (`Dockerfile.prod`, `nginx.conf`).

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
| `/lessons` | Paginated lesson list, filterable by instructor |
| `/lessons/new` | Log a lesson (`?studentId=` adds that student upfront) |
| `/lessons/:id` | Edit or delete a lesson |
| `/students` | Student list with search by name |
| `/students/:id` | Profile: IKO progression per level, lesson history and student details |
| `/students/new`, `/students/:id/edit` | Create and edit students |
| `/instructors`, `/instructors/new`, `/instructors/:id` | Instructor management |
| `/skills` | IKO tree: create, edit, move, deactivate and delete skills |

Routes and UI copy are in English.

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
