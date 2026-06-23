# The Next QR

The Next QR is a modern SaaS-style web app for creating and managing QR codes, with multi-organization support, role-based access, scan analytics, and email-based onboarding/invites.

## What it does

- Create and manage QR codes by organization.
- Support for static and dynamic QR codes:
  - website URL
  - phone (`tel:`)
  - SMS (`sms:`)
  - email (`mailto:`)
- Dynamic QR codes generate shareable public routes at `/q/[slug]` and are backed by scan logging.
- Team organization model:
  - Invite members
  - Role-based access (`owner`, `admin`, `member`)
  - Transfer ownership
  - Organization settings and profile
- Analytics dashboard for QR performance:
  - total scans
  - last-30-day trend
  - top QR codes
  - device/browser/OS breakdown
- Admin console for user management (admin/superadmin roles).
- Auth and onboarding via:
  - Magic link email
  - Google login
  - GitHub login
- Optional image upload storage via Cloudflare R2 with automatic fallback.

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Bun
- Tailwind CSS v4
- Drizzle ORM + PostgreSQL
- Better Auth
- next-safe-action
- React Query + TanStack Table
- Recharts
- React Email + workflow

## Route layout

The app is organized by route groups:

- `src/app/(marketing)` – public pages (`/`, `/privacy`, `/terms`)
- `src/app/(auth)` – login flows (`/login`)
- `src/app/(invitation)` – invitation acceptance (`/accept-invitation/[id]`)
- `src/app/(app)` – authenticated product UI
  - `/app` organization selector/onboarding
  - `/app/[orgId]/dashboard`
  - `/app/[orgId]/qr-codes`
  - `/app/[orgId]/settings`
- `src/app/(admin)` – admin-only area (`/admin`, `/admin/settings/users`)
- `src/app/q/[slug]` – public dynamic QR redirect/scan endpoint
- `src/app/api/auth/[...all]` – auth handler

## Prerequisites

- Bun
- PostgreSQL database
- OAuth app credentials for Google and GitHub (for social login)
- SMTP credentials (for magic links / invites / welcome emails)
- Optional: Cloudflare R2 credentials for production-grade upload storage

## Local setup

1. Install dependencies:

```bash
bun install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Fill `.env` with values (see **Environment variables**).
4. Start the dev server:

```bash
bun run dev
```

## Environment variables

Required:

- `APP_ENV` (`development | staging | production`)
- `DATABASE_URL`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_GITHUB_ID`
- `BETTER_AUTH_GITHUB_SECRET`
- `BETTER_AUTH_GOOGLE_ID`
- `BETTER_AUTH_GOOGLE_SECRET`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_FROM`

Optional:

- `ANALYZE=true` (bundle analysis for `bun run analyze`)
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

## Scripts

- `bun run dev` – Next.js dev server
- `bun run build` – production build
- `bun run start` – start built app
- `bun run lint` – ESLint
- `bun run type-check` – strict TS check
- `bun run format` – Prettier on `src`
- `bun run analyze` – webpack bundle analysis
- `bun run build:docker` – build Docker image using the included Dockerfile
- Database:
  - `bun run db:push` – push schema to PostgreSQL via Drizzle
  - `bun run db:reset` – drop and recreate `public` schema (non-production only)
  - `bun run db:seed` – run seed script
  - `bun run db:studio` – open Drizzle Studio
- Email/workflow:
  - `bun run email:dev` – local React Email preview server
  - `bun run email:test` – send test mail
  - `bun run workflow:inspect` – open workflow inspector

## Database bootstrap

After creating the DB and `.env`, initialize schema:

```bash
bun run db:push
bun run dev
```

The project uses Drizzle migrations from `src/db/schema.ts`.

## Working with uploads

- If all required R2 env vars are present, uploads use Cloudflare R2 presigned PUT URLs.
- If not configured, uploads fall back to base64 mode and the app still runs.
- Dynamic QR scan redirects at `/q/[slug]` are only served for QR records marked as dynamic.

## Notes

- There is currently no dedicated test suite configured.
- Route middleware includes a workflow exclusion path for `/.well-known/workflow/`.
- Route protection is enforced server-side: authenticated routes redirect unauthenticated users to `/login`, and admin routes enforce admin roles.

## Roadmap / known placeholders

- The current marketing homepage (`/`) is a minimal starter page in this repository snapshot.
- The app’s main product surface and management flows are implemented in the protected `/app` route group.

## Docker (optional)

```bash
bun run build:docker
docker run --env-file .env -p 3000:3000 my-app
```

## Contributing

If this repository is used collaboratively, use the existing coding conventions:

- Use the `~/*` import alias.
- Keep server logic server-only and move mutations through server actions.
- Run `bun run lint` and `bun run type-check` before shipping changes.
