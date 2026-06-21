# AGENTS.md

This file provides shared guidance for agentic coding tools working in this repository.

## What is this project

The Next QR is a Next.js SaaS app for creating and managing QR codes. It supports public marketing pages, authentication, organization-scoped app routes, admin-only routes, file uploads, email workflows, and QR scan tracking.

## Commands

Use Bun for package scripts:

```bash
bun run dev                # Start Next.js dev server
bun run build              # Production build with bun --bun next build
bun run start              # Start production server after a build
bun run lint               # ESLint
bun run type-check         # Strict TypeScript check with tsgo
bun run format             # Prettier and import organization for src files
bun run analyze            # Build with bundle analysis enabled

bun run db:push            # Apply Drizzle schema changes to Postgres
bun run db:seed            # Seed database
bun run db:reset           # Reset database via src/scripts/reset-db.ts
bun run db:studio          # Open Drizzle Studio

bun run email:dev          # React Email preview server for src/emails/
bun run email:test         # Run src/scripts/test-mail.ts
bun run workflow:inspect   # Open Workflow run inspector
bun run gen:auth           # Regenerate Better Auth schema artifacts
```

There is no general test script or single-test command in `package.json` until a test framework is added.

## Required environment variables

Defined and validated in [src/env.ts](src/env.ts) via `@t3-oss/env-nextjs`:

- `APP_ENV` - `development | staging | production`
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`
- `BETTER_AUTH_GITHUB_ID`, `BETTER_AUTH_GITHUB_SECRET`
- `BETTER_AUTH_GOOGLE_ID`, `BETTER_AUTH_GOOGLE_SECRET`
- `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_FROM`

Optional:

- `ANALYZE` - enables bundle analysis when set by `bun run analyze`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` - all required to enable Cloudflare R2 storage mode; otherwise uploads fall back to base64 mode

## Architecture

**Stack:** Next.js 16 App Router, Bun, React 19, TypeScript strict mode, Drizzle ORM with PostgreSQL, Better Auth, Tailwind CSS 4, shadcn-style UI primitives, Zod, next-safe-action, TanStack Query, React Email, and Workflow.

**Path alias:** `~/` maps to `src/`.

### Route groups

| Group          | URL prefix                | Purpose                                      |
| -------------- | ------------------------- | -------------------------------------------- |
| `(marketing)`  | `/`, `/privacy`, `/terms` | Public marketing and legal pages             |
| `(auth)`       | `/login`                  | Login UI                                     |
| `(invitation)` | `/accept-invitation/...`  | Organization invitation acceptance           |
| `(app)`        | `/app`, `/app/[orgId]`    | Authenticated organization-scoped product UI |
| `(admin)`      | `/admin`                  | Admin-only routes                            |
| `q/[slug]`     | `/q/[slug]`               | Public QR redirect/scan route                |
| `api/auth`     | `/api/auth/[...all]`      | Better Auth handler                          |
| `api/webhooks` | `/api/webhooks/stripe`    | Stripe webhook endpoint                      |

The root layout in [src/app/layout.tsx](src/app/layout.tsx) wires global providers: React Query, theme, top loader, Sonner toasts, and the development-only screen-size helper. It also sets `dynamic = 'force-dynamic'`.

The authenticated app layout redirects anonymous users to `/login`, loads the user's organizations, and renders the shared sidebar/header shell. The `/app/[orgId]` layout verifies that the current user belongs to the organization and provides organization context to child routes.

The admin layout requires `getAuthSession().isAdmin`. The `superadmin` flag only affects admin capabilities and navigation visibility.

### Auth and authorization

Authentication is centralized in [src/lib/auth.ts](src/lib/auth.ts) with Better Auth, Drizzle, GitHub/Google providers, magic links, admin, organization, and last-login-method plugins. The Drizzle adapter maps Better Auth models to tables in [src/db/schema.ts](src/db/schema.ts). `getAuthSession()` is cached per React request and augments the session with `isAdmin` and `isSuperAdmin`.

Client auth helpers are exported from [src/lib/auth-client.ts](src/lib/auth-client.ts).

Authorization is split by concern:

- Admin and superadmin safe-action clients are in [src/lib/safe-action.ts](src/lib/safe-action.ts).
- Organization membership and manager checks live in [src/lib/organization-access.ts](src/lib/organization-access.ts).
- Organization manager roles are `owner` and `admin`.
- Navigation visibility follows the same role rules in [src/lib/app-navigation.ts](src/lib/app-navigation.ts) and [src/lib/admin-navigation.ts](src/lib/admin-navigation.ts).

### Server actions

Server mutations use `next-safe-action`. Shared action clients are in [src/lib/safe-action.ts](src/lib/safe-action.ts), and client-side React Query wrappers are in [src/lib/safe-action-client.ts](src/lib/safe-action-client.ts).

Route-group actions live close to the relevant routes, such as `src/app/(app)/actions/*` and `src/app/(admin)/actions/*`. Shared pagination and sorting input schema helpers are in [src/lib/actions.ts](src/lib/actions.ts).

### Database

Database code uses Drizzle with Postgres:

- Schema: [src/db/schema.ts](src/db/schema.ts)
- Relations: [src/db/relations.ts](src/db/relations.ts)
- Shared typed client: [src/db/index.ts](src/db/index.ts)

The database client uses `env.DATABASE_URL`, reuses a global postgres-js client outside production to reduce dev hot-reload connections, sets pool `max: 1`, and disables prepared statements.

Existing tables cover Better Auth users/sessions/accounts/verifications, organizations/members/invitations, file uploads, QR codes, and QR scan logs.

### File storage

File uploads are abstracted in [src/lib/storage.ts](src/lib/storage.ts) and [src/actions/uploads.ts](src/actions/uploads.ts). When all required Cloudflare R2 environment variables are present, uploads use presigned R2 PUT URLs and records in `file_uploads`; otherwise upload actions return a `base64` mode.

Use `resolveImageUrl()` to convert stored R2 keys to public URLs and to preserve `data:` or HTTP URLs.

### Email and workflow

Email templates are React Email components in `src/emails/`. Email sending uses workflow-backed helpers in [src/lib/email-service.ts](src/lib/email-service.ts).

Better Auth starts workflows for welcome, magic link, and invitation emails. [next.config.ts](next.config.ts) wraps the app with `withWorkflow`, and [src/app/proxy.ts](src/app/proxy.ts) deliberately excludes `/.well-known/workflow/` from middleware matching so workflow execution and resumption can work.

### UI

UI primitives live in `src/components/ui` and are configured by [components.json](components.json) with `rsc: true`, Tailwind CSS in [src/app/globals.css](src/app/globals.css), Lucide icons, and aliases such as `~/components`, `~/components/ui`, `~/lib`, and `~/hooks`.

Shared shells and product components live in `src/components`. Route-local components use `_components` folders. The generic table component in `src/components/data-table` supports server-side pagination, sorting, searching, filters, column visibility, and skeleton states.

## Code style

Use the `~/*` path alias for app imports.

Prettier is configured for 2 spaces, single quotes, no semicolons, no trailing commas, organized imports, and Tailwind class sorting.

TypeScript is strict with `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, and `noImplicitReturns`.

Prefer React Server Components unless client interactivity is required. Keep server-only auth, database, and organization access logic out of client components; expose mutations through safe actions when client components need to change server state.
