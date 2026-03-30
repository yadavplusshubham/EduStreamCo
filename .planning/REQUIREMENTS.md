# Requirements: EduStream Next.js Migration

**Defined:** 2026-03-30
**Core Value:** Course and video pages must be crawlable by Google so that educational content ranks in search results.

## v1 Requirements

### Framework Migration

- [ ] **FRWK-01**: Next.js 14+ App Router project is set up with Tailwind CSS and shadcn/ui components from the CRA project
- [ ] **FRWK-02**: All environment variables are migrated to Next.js conventions (`NEXT_PUBLIC_*` for client, server-only for secrets)
- [ ] **FRWK-03**: The `@` path alias resolves to `src/` in Next.js config (matching current craco setup)
- [ ] **FRWK-04**: Next.js dev server runs on port 3001 and connects to the FastAPI backend on port 8001

### SSR & SEO

- [ ] **SEO-01**: Home page renders HTML on the server including course listings and category data (not client-only)
- [ ] **SEO-02**: Course/video pages render full course title, description, and metadata in server-rendered HTML
- [ ] **SEO-03**: Each course page has unique `<title>` and `<meta name="description">` tags derived from course data
- [ ] **SEO-04**: Home page has a meaningful `<title>` and `<meta name="description">` tag
- [ ] **SEO-05**: Browse/category pages render their course listings in server-rendered HTML
- [ ] **SEO-06**: `robots.txt` allows crawling of public pages (home, course, browse)

### Authentication

- [ ] **AUTH-01**: User can sign in with Google OAuth ("Sign in with Google" button on the login page)
- [ ] **AUTH-02**: Google OAuth is configured via environment variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) — no code changes needed to swap credentials
- [ ] **AUTH-03**: User session persists across browser refresh after Google OAuth sign-in
- [ ] **AUTH-04**: Admin can log in with username/password via the existing admin login form (no regression)
- [ ] **AUTH-05**: Admin session cookie works correctly in Next.js (forwarded to FastAPI backend)
- [ ] **AUTH-06**: All Emergent OAuth code is removed from the frontend (`EMERGENT_AUTH_URL`, OAuth redirect, session_id hash handling)
- [ ] **AUTH-07**: All Emergent OAuth endpoints and references are removed from the backend (`/api/auth/session`, Emergent session verification)
- [ ] **AUTH-08**: User can sign out and session is cleared

### Pages

- [ ] **PAGE-01**: Home page shows featured courses, category browsing, and platform stats (full feature parity with CRA version)
- [ ] **PAGE-02**: Course/video watch page plays YouTube video and shows course metadata (full feature parity)
- [ ] **PAGE-03**: Browse/category page shows courses filtered by category and/or university (full feature parity)
- [ ] **PAGE-04**: Admin page retains all management features — course add/edit/delete, university management, category management (full feature parity)
- [ ] **PAGE-05**: Auth/login page shows Google OAuth sign-in button and admin login form
- [ ] **PAGE-06**: 404 page renders for unknown routes
- [ ] **PAGE-07**: Navigation header and footer work correctly across all pages (links, auth state display)

### Branding Cleanup

- [ ] **BRAND-01**: No Emergent branding visible in the UI (logos, names, links, footers, loading screens)
- [ ] **BRAND-02**: No references to `emergentagent.com`, `auth.emergentagent.com`, or `streamlearn` in frontend code
- [ ] **BRAND-03**: No references to Emergent in backend code, comments, or environment variable names

### Testing

- [ ] **TEST-01**: Jest + React Testing Library is configured and runs with `npm test`
- [ ] **TEST-02**: Component tests exist for the CourseCard component (renders title, category, thumbnail)
- [ ] **TEST-03**: Component tests exist for the navigation header (shows correct auth state)
- [ ] **TEST-04**: Component tests exist for the admin login form (submit, error state, loading state)

## v2 Requirements

### SEO Enhancements

- **SEO-V2-01**: Sitemap XML generated at `/sitemap.xml` listing all course pages
- **SEO-V2-02**: Structured data (JSON-LD) on course pages for rich search results
- **SEO-V2-03**: OpenGraph image meta tags for social sharing

### User Features

- **USER-V2-01**: User profile page showing enrolled/bookmarked courses
- **USER-V2-02**: My Courses page with watch progress
- **USER-V2-03**: Course bookmarking / save-for-later

### Testing Expansion

- **TEST-V2-01**: MSW (Mock Service Worker) for API mocking in tests
- **TEST-V2-02**: Page-level smoke tests (each route renders without crashing)
- **TEST-V2-03**: SSR rendering tests (pages produce correct HTML on server)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend rewrite | FastAPI stays as-is — frontend-only migration, risk too high |
| New brand/visual redesign | Keeping EduStream name and current dark UI |
| Email/password auth for users | Using Google OAuth instead — simpler, no email infra needed |
| Mobile app | Web-first only |
| Real-time notifications | Not in current product, not needed for SEO goal |
| Pages Router migration path | App Router is the current standard, no reason to use Pages Router |
| Multi-provider OAuth (GitHub, etc.) | Google only for v1 — can add more providers in v2 via NextAuth |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FRWK-01 | Phase 1 | Pending |
| FRWK-02 | Phase 1 | Pending |
| FRWK-03 | Phase 1 | Pending |
| FRWK-04 | Phase 1 | Pending |
| AUTH-06 | Phase 1 | Pending |
| AUTH-07 | Phase 1 | Pending |
| BRAND-01 | Phase 1 | Pending |
| BRAND-02 | Phase 1 | Pending |
| BRAND-03 | Phase 1 | Pending |
| SEO-01 | Phase 2 | Pending |
| SEO-02 | Phase 2 | Pending |
| SEO-03 | Phase 2 | Pending |
| SEO-04 | Phase 2 | Pending |
| SEO-05 | Phase 2 | Pending |
| SEO-06 | Phase 2 | Pending |
| PAGE-01 | Phase 2 | Pending |
| PAGE-02 | Phase 2 | Pending |
| PAGE-03 | Phase 2 | Pending |
| PAGE-05 | Phase 2 | Pending |
| PAGE-06 | Phase 2 | Pending |
| PAGE-07 | Phase 2 | Pending |
| AUTH-01 | Phase 3 | Pending |
| AUTH-02 | Phase 3 | Pending |
| AUTH-03 | Phase 3 | Pending |
| AUTH-04 | Phase 3 | Pending |
| AUTH-05 | Phase 3 | Pending |
| AUTH-08 | Phase 3 | Pending |
| PAGE-04 | Phase 3 | Pending |
| TEST-01 | Phase 4 | Pending |
| TEST-02 | Phase 4 | Pending |
| TEST-03 | Phase 4 | Pending |
| TEST-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-30*
*Last updated: 2026-03-30 — traceability verified against ROADMAP.md phases*
