# Project Rules

This document defines the coding standards and architectural patterns for the `www` and `backend` projects within this monorepo.

## Overview
Upwind Board lets IKO kitesurf instructors log their lessons and track each student's progression through the IKO skill tree (levels → skills → sub-skills). A student's current progression is not stored: it is derived from the latest status recorded per skill across their lessons.

## 🛠 Backend Project (NestJS)

### Architecture Patterns
- **Hexagonal/Clean Architecture**:
  - `src/domain`: Domain entities and repository interfaces.
  - `src/application`: Use Cases (all business logic MUST live here) and DTOs.
  - `src/infrastructure`: Framework-specific implementations. Includes TypeORM entities, repositories, migrations, REST controllers (`src/infrastructure/rest/controllers`), mappers (`src/infrastructure/persistence/type-orm/mappers`), cache, etc.
- **Persistence**: Use TypeORM with PostgreSQL. Always use migrations for schema changes.
- **Security**:
  - Use **Argon2** for password hashing.
  - Standardize on **JWT** authentication delivered via secure cookies.
- **Observability & Caching**: Use **Sentry** (`@sentry/nestjs`) for observability and **Redis** (`@keyv/redis`) for caching.
- **Validation**: Rely on **class-validator** and **class-transformer** for robust data validation.

### Domain-Specific Rules
- **Policy Management**: The `resource` field in policy statements MUST always contain `clientIds`. **NEVER** use AWS ARNs in this field.

---

## 🎨 Frontend Project (Vite + React)

### UI & UX Standards
- **Component Library**: [Mantine v7](https://mantine.dev/).
- **Design Philosophy**:
  - High-quality aesthetics with dark mode support.
  - Use vibrant accent colors and glassmorphism where appropriate.
  - Implement smooth transitions, micro-animations, and interactive hover effects.

### Technical Stack
- **Routing**: [TanStack Router](https://tanstack.com/router) (File-based routing).
  - Use `_authenticated.tsx` and `_public.tsx` layouts for access control.
- **State & Data Fetching**: [TanStack Query](https://tanstack.com/query).
  - Organize logic into `src/queries` and `src/mutations`.
- **Forms**: [React Hook Form](https://react-hook-form.com/) combined with [Zod](https://zod.dev/) for schema validation.
- **Project Structure**: Modular organization using `src/components`, `src/hooks`, `src/pages`, `src/schemas`, `src/types`, and `src/utils` folders for consistent separation of concerns.

---

## 🚀 General Guidelines
- Use **yarn** for package management.
- Ensure all new features are covered by basic unit tests.
