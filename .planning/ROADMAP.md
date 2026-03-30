# Roadmap: EduStream Next.js Migration

## Overview

This migration moves EduStream's CRA/React SPA to Next.js 14+ App Router so that course and video pages become crawlable by Google. The work proceeds in four phases: scaffold the Next.js project and strip Emergent branding, port all pages with SSR/SSG for SEO, wire up Google OAuth and finalize the admin page, then establish a frontend test suite. Each phase delivers a coherent, independently verifiable capability before the next begins.

## Phases

- [ ] **Phase 1: Foundation** - Next.js project scaffolded, environment configured, Emergent branding fully removed from frontend and backend
- [ ] **Phase 2: Pages + SSR** - All public pages ported to Next.js with server-rendered HTML and complete SEO metadata
- [ ] **Phase 3: Auth + Admin** - Google OAuth live for users, admin session working in Next.js, admin page fully ported
- [ ] **Phase 4: Testing** - Jest + React Testing Library configured with targeted component tests for critical UI

## Phase Details

### Phase 1: Foundation
**Goal**: A running Next.js 14 App Router project replaces the CRA build, with no Emergent references remaining anywhere in the codebase
**Depends on**: Nothing (first phase)
**Requirements**: FRWK-01, FRWK-02, FRWK-03, FRWK-04, AUTH-06, AUTH-07, BRAND-01, BRAND-02, BRAND-03
**Success Criteria** (what must be TRUE):
  1. `npm run dev` (or equivalent) starts the Next.js dev server on port 3001 and the app loads in the browser
  2. No page, component, environment file, or backend file contains any reference to `emergentagent.com`, `EMERGENT_AUTH_URL`, `streamlearn`, or Emergent-owned logos/names
  3. The `@` path alias resolves correctly — imports like `@/components/...` work without error
  4. `NEXT_PUBLIC_*` variables are used for client-side config and secret credentials (Google, MongoDB) are server-only env vars
**Plans**: TBD

### Phase 2: Pages + SSR
**Goal**: All seven pages exist in Next.js with full feature parity, public pages render HTML on the server, and every course/category page carries unique SEO metadata
**Depends on**: Phase 1
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, PAGE-01, PAGE-02, PAGE-03, PAGE-05, PAGE-06, PAGE-07
**Success Criteria** (what must be TRUE):
  1. `curl`-ing the home page URL returns HTML that includes course titles and category names (not a blank JS shell)
  2. `curl`-ing a course page URL returns HTML that includes the course title, description, and a populated `<title>` and `<meta name="description">` tag unique to that course
  3. Browse/category pages return server-rendered course listings when fetched without JavaScript
  4. A `robots.txt` file is served that allows crawling of `/`, `/browse`, and `/watch/*` routes
  5. Navigating to an unknown route renders a 404 page (not a blank screen or JS error)
  6. The navigation header reflects the correct auth state and all links work across every ported page
**Plans**: TBD

### Phase 3: Auth + Admin
**Goal**: Users can sign in with Google OAuth and stay signed in, admins can log in with username/password without regression, and the full admin management panel works in Next.js
**Depends on**: Phase 2
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-08, PAGE-04
**Success Criteria** (what must be TRUE):
  1. Clicking "Sign in with Google" redirects to Google, completes the OAuth flow, and returns the user to the app in a signed-in state
  2. Refreshing the browser after signing in with Google keeps the user signed in (session persists)
  3. Clicking sign-out clears the session and the user is returned to a signed-out state
  4. The admin can log in with username/password at the admin login form and reach the admin dashboard — no regression from the existing flow
  5. Admin actions (add course, edit course, delete course, manage universities, manage categories) all work correctly in the Next.js version
  6. Swapping Google OAuth credentials requires only an environment variable change — no code modifications needed
**Plans**: TBD

### Phase 4: Testing
**Goal**: A Jest + React Testing Library test suite runs against the Next.js codebase and covers the three highest-risk UI components
**Depends on**: Phase 3
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. `npm test` runs without configuration errors and reports a pass/fail result
  2. A test for CourseCard verifies it renders the course title, category label, and thumbnail
  3. A test for the navigation header verifies it shows the correct state when the user is signed in vs. signed out
  4. A test for the admin login form verifies submit behavior, loading state, and error display
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/TBD | Not started | - |
| 2. Pages + SSR | 0/TBD | Not started | - |
| 3. Auth + Admin | 0/TBD | Not started | - |
| 4. Testing | 0/TBD | Not started | - |
