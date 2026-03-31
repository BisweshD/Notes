<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Overview

PsychScribe is a single Next.js 16 application (TypeScript, React 19) using embedded SQLite via `better-sqlite3` and Drizzle ORM. No external services are required — AI providers are fully mocked by default (`AI_PROVIDER=mock`, `TRANSCRIPTION_PROVIDER=mock`).

### Environment setup

1. Copy `.env.example` to `.env` and set `AUTH_SECRET` to a random base64 string (e.g. `openssl rand -base64 32`). All other defaults are fine for development.
2. Run `pnpm db:migrate` then `pnpm db:seed` to initialize the SQLite database at `./data/psychiatry.db`.
3. Seed credentials: `dr.chen@clearview.example.com` / `password123`.

### Common commands

See `package.json` scripts. Key commands:
- `pnpm dev` — start dev server on port 3000
- `pnpm build` — production build
- `pnpm lint` — ESLint (pre-existing warnings/errors in codebase)
- `pnpm test` — Vitest unit tests
- `pnpm format:check` / `pnpm format` — Prettier checks/fixes
- `pnpm db:migrate` / `pnpm db:seed` — database setup
- `pnpm db:studio` — Drizzle Studio GUI (port 4983)

### Caveats

- The database file (`data/psychiatry.db`) is gitignored. If it's missing, re-run `pnpm db:migrate && pnpm db:seed`.
- `pnpm lint` has 2 pre-existing errors (`react-hooks/error-boundaries` in encounter pages) and ~27 warnings. These are not caused by setup.
- `pnpm format:check` fails on ~63 files due to pre-existing formatting inconsistencies.
- The `msw` package build script is ignored via `pnpm.onlyBuiltDependencies` in `package.json` (safe to ignore the warning).
