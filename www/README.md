# Upwind Board — Frontend

App for IKO instructors to log lessons, follow each student's progression and manage the skill tree.

Vite · React 19 · Mantine 7 · TanStack Router (file-based routes) · TanStack Query · React Hook Form + Zod

## Getting started

The app runs with Docker from the repository root together with the API; see the [root README](../README.md):

```bash
cp www/.env.example www/.env
docker compose up --build -d   # http://localhost:5000
```

The browser calls the API directly at `VITE_API_URL` (`http://localhost:5001` locally), so the API lists the app's origin in `CORS_ORIGINS`. Production builds read it from `.env` at build time and are served by nginx (`Dockerfile.prod`, `nginx.conf`).

| Command | What it does |
| --- | --- |
| `yarn dev` | Development server |
| `yarn build` | Typecheck + production build in `dist/` |
| `yarn preview` | Serves the production build |
| `yarn format` | Prettier |
| `yarn test` | Unit tests (Vitest) |

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
| `/inventory` | School equipment: create, edit, filter by type and status, retire and delete |
| `/skills` | IKO tree: create, edit, move, deactivate and delete skills |

Routes and UI copy are in English.

When logging a lesson, each student gets a card with kite, board, notes and a per-level editor where each skill is marked as Introduced, Practiced or Mastered. Next to every skill, the editor shows the last status recorded for that student. Inactive skills only show up if the lesson already recorded them. School equipment can optionally be assigned to the lesson from the Equipment picker (only available items are offered).

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
  components/   UI by domain (layout, common, lessons, students, skills, instructors, equipment)
  pages/        one page per screen
  routes/       TanStack Router routes (thin: loader + page)
  theme/        Mantine theme and global styles (glassmorphism, animations)
```

Every screen hangs from `routes/_authenticated.tsx`, whose `beforeLoad` checks the session with the API (`POST /auth/userinfo`, cached for 5 minutes). It sends signed-out users to `/login` and accounts without permissions on the app to `/no-access`, both under `routes/_public.tsx`. `/callback` completes the IAM login.

The IAM integration lives in `src/iam` (import it from `@/iam`): `AuthProvider` / `useAuth` hold the session and `CallbackPage` validates the OAuth `state`. The session itself is an httpOnly cookie set by the API, so `api/http.ts` sends `credentials: 'include'`. Any 401 dispatches `UNAUTHORIZED_EVENT`, and the provider answers it by signing the user out with a single "Session expired" notice.
