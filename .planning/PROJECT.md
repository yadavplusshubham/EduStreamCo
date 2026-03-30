# EduStream Next.js Migration

## What This Is

EduStream is an educational video streaming platform (Netflix-like dark UI) that serves YouTube-based courses organized by university and category. The platform currently runs on a CRA/React SPA frontend with a FastAPI/MongoDB backend. This project migrates the frontend to Next.js with SSR for Google SEO crawlability, replaces Emergent OAuth with Google OAuth for regular users, removes all Emergent branding, and keeps the existing admin-only username/password login.

## Core Value

Course and video pages must be crawlable by Google so that educational content ranks in search results.

## Requirements

### Validated

- ✓ Course browsing by category and university — existing
- ✓ YouTube playlist ingestion into course catalog — existing
- ✓ Video watch page with YouTube player — existing
- ✓ Admin panel for managing courses, universities, categories — existing
- ✓ Admin username/password login with session cookie — existing
- ✓ Featured courses and stats on home page — existing
- ✓ Dark UI with Tailwind CSS and shadcn/ui component library — existing
- ✓ REST API backend (FastAPI + MongoDB) — existing

### Active

- [ ] Migrate frontend from CRA/React to Next.js 14+ (App Router)
- [ ] Add SSR/SSG with `generateMetadata()` for home and course/video pages
- [ ] Replace Emergent OAuth with Google OAuth for regular users (credentials-based setup)
- [ ] Remove all Emergent branding from frontend and backend (URLs, logos, references)
- [ ] Admin login continues to work with clean username/password form (no regression)
- [ ] All 7 existing pages ported to Next.js with feature parity
- [ ] Frontend test suite added (Jest + React Testing Library + MSW)

### Out of Scope

- New brand name or visual redesign — keeping EduStream name and current color system
- Mobile app — web only
- User profile/settings features — deferred; not currently built out
- Email/password auth for regular users — using Google OAuth instead
- Real-time features (notifications, live updates) — not in scope

## Context

**Current frontend:** React 19 SPA, CRA/craco build, react-router-dom v7, 43 shadcn/ui Radix components, Tailwind CSS, client-side only rendering. Google cannot crawl course content.

**Auth situation:** Emergent OAuth (`auth.emergentagent.com`) handles regular user login. Admin uses a separate username/password endpoint (`/api/auth/admin/login`) that already works correctly. The Emergent auth needs full removal — frontend OAuth flow, `EMERGENT_AUTH_URL` constant, and any backend session endpoints tied to Emergent.

**Google OAuth plan:** User has Google OAuth credentials. Backend needs a new `/api/auth/google/callback` endpoint. Frontend needs a "Sign in with Google" button that replaces the current Emergent redirect. NextAuth.js is the standard integration path.

**SEO focus:** Home page and course/video pages. These are the discovery surfaces. Other pages (admin, profile, watch) do not need SSR priority.

**Backend stays as-is:** FastAPI/MongoDB backend remains unchanged except for auth endpoint additions and Emergent removal. No backend rewrite.

**YouTube API key:** Available. Course import works.

**Existing bugs fixed (pre-migration):**
- CORS fixed: explicit origins instead of wildcard
- Cookie security fixed: `secure=False, samesite="lax"` for localhost
- `.env` files created for both frontend and backend

## Constraints

- **Tech stack**: Next.js 14+ (App Router), keep Tailwind + shadcn/ui — no component rewrites beyond necessary adapter changes
- **Backend**: Python FastAPI stays — no rewrite, no language change
- **Compatibility**: All existing API endpoints must continue to work from Next.js frontend
- **Auth**: Google OAuth must be configurable via environment variables (client ID + secret) — user plugs in credentials, no code changes needed
- **No rewrite of business logic**: Course management, YouTube ingestion, admin functions all preserved as-is

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router (not Pages Router) | Modern, recommended for new projects, `generateMetadata()` is first-class | — Pending |
| NextAuth.js for Google OAuth | Industry standard, handles sessions, CSRF, token rotation automatically | — Pending |
| Keep shadcn/ui components | Already installed, no visual regression risk from porting | — Pending |
| SSR only for home + course pages | These are the SEO surfaces; admin/watch/profile don't need it | — Pending |
| Backend unchanged | Risk too high to rewrite FastAPI + MongoDB; frontend-only migration | — Pending |

---
*Last updated: 2026-03-30 after initialization*
