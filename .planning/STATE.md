# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-30)

**Core value:** Course and video pages must be crawlable by Google so that educational content ranks in search results.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 4 (Foundation)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-03-30 — Roadmap created, ready to begin Phase 1 planning

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Init: Next.js App Router chosen (not Pages Router) — `generateMetadata()` is first-class
- Init: NextAuth.js for Google OAuth — handles sessions, CSRF, token rotation automatically
- Init: Backend (FastAPI + MongoDB) stays unchanged — frontend-only migration
- Init: SSR scoped to home + course/browse pages only — admin/watch do not need it

### Pending Todos

None yet.

### Blockers/Concerns

- Admin credentials are hardcoded defaults in backend/server.py — not blocking migration but worth noting before production
- Session cookie `secure=False` is hardcoded — needs environment-based fix before production deploy

## Session Continuity

Last session: 2026-03-30
Stopped at: Roadmap created — no plans written yet
Resume file: None
