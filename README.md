# KOPL Tjekskema MVP

SvelteKit MVP for a living project startup checklist. The app turns the old Word-based startup checklist into a structured, revisitable project report with checklist answers, assessments, actions, review flow, and history.

## Stack

- SvelteKit
- TypeScript
- Local JSON persistence in `data/db.json`
- Server-side `load` functions and form actions

## What the MVP includes

- Project dashboard at `/`
- New project creation at `/projects/new`
- Project overview at `/projects/[id]`
- Checklist editor at `/projects/[id]/checklist`
- Generated startup report at `/projects/[id]/report`
- Focused unresolved-item review at `/projects/[id]/review`
- Revision history at `/projects/[id]/history`
- Seeded Danish demo content and example projects

## Run locally

```sh
npm install
npm run dev
```

Then open the local SvelteKit URL shown in the terminal.

The first request will auto-create `data/db.json` from the seeded demo dataset if the file does not already exist.

## Useful scripts

```sh
npm run check
npm run build
npm run preview
```

## Architecture

### UI and routes

- Route files under `src/routes` handle the six user flows directly.
- `src/routes/projects/[id]/+layout.server.ts` loads shared project state once and reuses it across overview, checklist, report, review, and history.
- Shared UI components live in `src/lib/components`.

### Domain and persistence

- `src/lib/types.ts` contains the core models and form-state types.
- `src/lib/server/seed.ts` defines the checklist template topics, seeded questions, and demo projects.
- `src/lib/server/database.ts` is the repository layer for reading and writing the JSON database.
- `src/lib/server/forms.ts` parses and validates project and checklist form submissions.
- `src/lib/server/project-summary.ts` creates derived dashboard/report/review metrics from stored checklist data.

### Why this is structured for later extension

- The route layer talks to a repository/service layer rather than directly to files.
- Mock current-user handling is isolated in `src/lib/server/current-user.ts`.
- Seed/template definition is isolated so a later admin module can manage it.
- Inline `TODO` comments mark where future Entra ID, SharePoint, EA Tools, LER, and export integrations should plug in.

## Data behavior

- Every new project is created from one fixed seeded template.
- Checklist items store answer, assessment, consequence, action, responsible, deadline, status, documentation link, and notes.
- Conflict and constraint items require consequence and action.
- Every metadata or checklist update creates a history entry with initials and before/after summaries.

## Vercel note

- Local development uses `data/db.json` directly.
- On Vercel, the app now boots from the seeded data and writes runtime changes to `/tmp/tjekskema-db.json` because the deployed app filesystem is read-only.
- This makes the demo run without 500 errors, but the data is still ephemeral on Vercel and can reset on cold starts, new instances, or redeploys.
- For real persistence on Vercel, move the repository layer to SQLite/Postgres/KV/Blob instead of local files.

## Notes for future work

- Replace JSON persistence with SQLite/Prisma when multi-user or more complex querying is needed.
- Add Microsoft Entra ID and replace the mock user service.
- Add SharePoint, EA Tools, LER, and export services behind the repository/integration layer.
- Add template administration, search, and version comparison as separate modules rather than expanding the current route handlers.
