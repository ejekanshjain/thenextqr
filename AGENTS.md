# Repository Guidelines

## Commands

Use Bun for package scripts:

- `bun run dev` starts the Next.js dev server.
- `bun run build` creates a production build with `bun --bun next build`.
- `bun run start` starts the production server after a build.
- `bun run lint` runs ESLint.
- `bun run type-check` runs strict TypeScript checking with `tsgo --incremental false`.
- `bun run format` formats `src/**/*.{js,cjs,mjs,jsx,ts,tsx}` with Prettier and import organization.
- `bun run analyze` builds with bundle analysis enabled.
- `bun run email:dev` previews React Email templates from `src/emails`.
- `bun run email:test` runs the mail test script at `src/scripts/test-mail.ts`.
- `bun run workflow:inspect` opens the Workflow run inspector.
- `bun run db:push` applies Drizzle schema changes to Postgres.
- `bun run db:seed` seeds the database.
- `bun run db:reset` resets the database via `src/scripts/reset-db.ts`.
- `bun run db:studio` opens Drizzle Studio.
- `bun run gen:auth` regenerates Better Auth schema artifacts.

There is no general test script or test runner configured in `package.json`. There is also no single-test command to use until a test framework is added.

## Architecture

This is a Next.js 16 App Router app using Bun, React 19, TypeScript strict mode, Tailwind CSS 4, and shadcn-style UI primitives. App routes live under `src/app` and are grouped by route segments:

- `(marketing)` contains public pages.
- `(auth)` contains login UI.
- `(invitation)` handles organization invitation acceptance.
- `(app)` contains authenticated organization-scoped product routes under `/app` and `/app/[orgId]`.
- `(admin)` contains admin-only routes under `/admin`.
- `src/app/api/auth/[...all]/route.ts` is the Better Auth handler.

The root layout in `src/app/layout.tsx` wires global providers: React Query, theme, top loader, Sonner toasts, and the development-only screen-size helper. It also sets `dynamic = 'force-dynamic'`. The authenticated app layout redirects anonymous users to `/login`, loads the user's organizations, and renders the shared sidebar/header shell. The `/app/[orgId]` layout verifies that the current user belongs to the organization and provides organization context to child routes. The admin layout requires `getAuthSession().isAdmin`, while `superadmin` only affects admin capabilities and navigation.

Authentication is centralized in `src/lib/auth.ts` with Better Auth, Drizzle, GitHub/Google providers, magic links, admin, organization, and last-login-method plugins. The Drizzle adapter maps Better Auth models to tables in `src/db/schema.ts`. `getAuthSession()` is cached per React request and augments the session with `isAdmin` and `isSuperAdmin`. Client auth helpers are exported from `src/lib/auth-client.ts`.

Authorization is split by concern. Admin and superadmin safe-action clients are in `src/lib/safe-action.ts`. Organization access checks live in `src/lib/organization-access.ts`, including cached organization membership lookups and manager checks for `owner` and `admin` roles. Navigation visibility follows the same role rules in `src/lib/app-navigation.ts` and `src/lib/admin-navigation.ts`.

Database code uses Drizzle with Postgres. The schema is in `src/db/schema.ts`, relations are in `src/db/relations.ts`, and the shared typed client is in `src/db/index.ts`. The database client uses `env.DATABASE_URL`, reuses a global postgres-js client outside production to reduce dev hot-reload connections, sets pool `max: 1`, and disables prepared statements. Existing tables cover Better Auth users/sessions/accounts/verifications, organizations/members/invitations, file uploads, QR codes, and QR scan logs.

Server mutations use `next-safe-action`. Shared action clients are in `src/lib/safe-action.ts`; client-side React Query wrappers for safe actions are in `src/lib/safe-action-client.ts`. Route-group actions live close to the relevant routes, such as `src/app/(app)/actions/*` and `src/app/(admin)/actions/*`. Shared pagination and sorting input schema helpers are in `src/lib/actions.ts`.

Email sending uses React Email templates in `src/emails` and workflow-backed functions in `src/lib/email-service.ts`. Better Auth starts workflows for welcome, magic link, and invitation emails. `next.config.ts` wraps the app with `withWorkflow`, and `src/app/proxy.ts` deliberately excludes `/.well-known/workflow/` from middleware matching so workflow execution and resumption can work.

File uploads are abstracted in `src/lib/storage.ts` and `src/actions/uploads.ts`. When Cloudflare R2 environment variables are present, uploads use presigned R2 PUT URLs and records in `file_uploads`; otherwise upload actions return a `base64` mode. `resolveImageUrl()` converts stored R2 keys to public URLs and preserves data/HTTP URLs.

Environment variables are validated in `src/env.ts` with `@t3-oss/env-nextjs`. Required server env includes app/auth/database/email provider settings; R2 settings are optional and enable object storage behavior only when all required R2 values are set.

UI primitives live in `src/components/ui`, configured by `components.json` with aliases such as `~/components`, `~/components/ui`, `~/lib`, and `~/hooks`, `rsc: true`, Tailwind CSS in `src/app/globals.css`, and Lucide icons. Shared shells and product components live in `src/components`, while route-local components use `_components` folders. The generic table component in `src/components/data-table` supports server-side pagination, sorting, searching, filters, column visibility, and skeleton states.

## Code Style

Use the `~/*` path alias for app imports. Prettier is configured for 2 spaces, single quotes, no semicolons, no trailing commas, organized imports, and Tailwind class sorting. TypeScript is strict with `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, and `noImplicitReturns`.

Prefer React Server Components unless client interactivity is required. Keep server-only auth, database, and organization access logic out of client components; expose mutations through safe actions when client components need to change server state.
