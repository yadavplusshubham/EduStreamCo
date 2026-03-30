# Codebase Concerns

**Analysis Date:** 2026-03-30

## Tech Debt

**Monolithic Backend Architecture:**
- Issue: Backend is a single 1,430-line FastAPI server with no separation of concerns - all routes, models, auth, YouTube API integration mixed in one file
- Files: `backend/server.py`
- Impact: Difficult to test in isolation, modify endpoints without risking breakage, or scale components independently
- Fix approach: Refactor into separate modules (`auth.py`, `courses.py`, `youtube.py`, `whitelist.py`) with clear interfaces and error handling

**Third-Party Auth Dependency - Emergent Auth:**
- Issue: Frontend and backend depend on `https://auth.emergentagent.com` service for OAuth flow. Hardcoded URL in multiple places with warning comments not to add fallbacks
- Files: `frontend/src/context/AuthContext.jsx` (lines 7, 131-133), `backend/server.py` (line 33, 409)
- Impact: Complete authentication failure if external service goes down. No fallback mechanism. Vendor lock-in to proprietary auth provider
- Fix approach: Migrate to standard OAuth2 (Google, GitHub) or custom JWT-based auth. Remove `EMERGENT_AUTH_URL` references entirely. Implement fallback auth mechanism

**Admin Credentials Hardcoded with Weak Defaults:**
- Issue: Admin username/password in `backend/server.py` (lines 29-30) with default values `EduADLogin` / `P1usD@pper@#stream`
- Files: `backend/server.py`
- Impact: Default credentials widely exposed in source control. Anyone with code access can admin the platform
- Fix approach: Use `secrets` module to generate strong defaults, require env vars without defaults, implement credential rotation policy

**No Error Boundaries in React:**
- Issue: Frontend has no ErrorBoundary component - any React component error crashes entire app with blank screen
- Files: `frontend/src/App.js`, `frontend/src/index.js` - no error boundary wrapper
- Impact: Any component error silently breaks user experience. No graceful degradation or error logging
- Fix approach: Implement React ErrorBoundary at `frontend/src/App.js` root level, add fallback UI, integrate error tracking (Sentry)

**Zero SEO in SPA:**
- Issue: CRA React SPA has no server-side rendering. No meta tags, structured data, or sitemap
- Files: `frontend/public/index.html`, entire `frontend/src` tree
- Impact: Cannot be indexed by search engines. All courses invisible to organic discovery
- Fix approach: Migrate to Next.js for SSR, or add static pre-rendering for course listing pages, generate sitemaps

---

## Known Bugs

**Session Cookie Set with secure=False on HTTP:**
- Symptom: Session cookies sent unencrypted over HTTP. Previously vulnerable to MITM attacks
- Files: `backend/server.py` (lines 457-465 and 531-539 - `secure=False`)
- Trigger: Any user login creates insecure cookie
- Workaround: Enable HTTPS in production and set `secure=True` conditionally
- Status: Code shows `secure=False` hardcoded - needs dynamic environment-based fix

**CORS Misconfiguration (Already Patched):**
- Symptom: Previously allowed all origins with credentials enabled (`allow_origins=["*"]`)
- Files: `backend/server.py` (lines 1420-1426 now correctly limited to localhost)
- Current state: Fixed to `["http://localhost:3001", "http://127.0.0.1:3001"]`
- Risk if reverted: Cross-origin credential theft possible

---

## Security Considerations

**YouTube API Key Exposure:**
- Risk: API key required but may be empty or leaked. No rotation mechanism
- Files: `backend/server.py` (lines 25-26), multiple API calls to YouTube (lines 245, 274, 304, 320, etc.)
- Current mitigation: Env var loading via `python-dotenv`
- Recommendations:
  - Add quota checks before rate limit hits
  - Implement API key rotation schedule
  - Monitor quota usage alerts
  - Consider API key scoping to YouTube Data API only

**Session Token Generation Predictability:**
- Risk: Session tokens use `uuid.uuid4()` which is cryptographically sound, but tokens have no rotation
- Files: `backend/server.py` (lines 446, 520)
- Current mitigation: Token expiry set to 7 days (lines 447, 521)
- Recommendations: Implement token refresh mechanism, add session invalidation endpoints, log token usage

**Auth Session Validation Against External Service:**
- Risk: Backend validates sessions by calling external Emergent Auth API (line 408). Network failure = auth failure
- Files: `backend/server.py` (lines 407-411)
- Current mitigation: None - no timeout or fallback
- Recommendations: Cache session validation, implement timeout, have offline validation fallback

**No Input Validation on Admin Operations:**
- Risk: Admin endpoints accept user input without validation before database operations
- Files: `backend/server.py` (lines 550-576 recategorization, 1352-1382 auto-add)
- Impact: Potential for injection, DoS via large uploads, malformed data corruption
- Fix: Add Pydantic validators, rate limiting, input sanitization

**localStorage User Data Storage:**
- Risk: User data and auth tokens stored in localStorage without encryption
- Files: `frontend/src/context/AuthContext.jsx` (lines 75-84, 121), `frontend/src/App.js` (lines 71-88)
- Impact: XSS attacks can steal user data from browser storage
- Recommendations: Use httpOnly cookies exclusively, remove localStorage auth backup, encrypt sensitive data

---

## Performance Bottlenecks

**YouTube API Calls on Every Course Fetch:**
- Problem: Each course creation calls multiple YouTube API endpoints sequentially (playlist details, items, video details)
- Files: `backend/server.py` (lines 594-609)
- Cause: No batching, no caching layer
- Improvement path:
  - Implement Redis caching for YouTube responses (2-4 hour TTL)
  - Batch video detail requests (currently limited to 50 per request, can be parallelized)
  - Cache playlist metadata permanently

**In-Memory Course Filtering:**
- Problem: All courses fetched from database and filtered in application code
- Files: `backend/server.py` (lines 690-717)
- Cause: Database query returns entire collection, filtering happens in Python
- Improvement path: Push filtering to MongoDB query layer using `$or`, `$regex`, proper indexing

**Frontend Makes Multiple Fetch Calls in Series:**
- Problem: App.js fetches courses on mount, watch progress from localStorage, then re-fetches on search
- Files: `frontend/src/App.js` (lines 51-68)
- Improvement path: Implement React Query or SWR for request deduplication, background refresh strategy

---

## Fragile Areas

**YouTube Playlist Import (Line-of-Business Critical):**
- Files: `backend/server.py` (lines 580-687), `frontend/src/pages/AdminPage.jsx` (lines 200-600)
- Why fragile:
  - Depends entirely on YouTube API - if format changes or API is deprecated, feature breaks
  - No validation of video count limits (50 max in fetch but no limit enforcement)
  - Thumbnail URLs can break (relies on YouTube CDN structure)
  - If any single video in playlist is restricted/removed, entire import can fail silently
- Safe modification:
  - Add retry logic with exponential backoff
  - Implement video count validation and warnings
  - Cache YouTube responses before save to database
  - Test with edge cases: 1 video, 500+ videos, private videos, age-restricted content
- Test coverage: Zero unit tests for YouTube integration

**Admin Authentication Flow:**
- Files: `frontend/src/pages/AdminPage.jsx` (lines 133-162), `backend/server.py` (lines 498-546)
- Why fragile:
  - Plain text password comparison (no hashing)
  - Credentials hardcoded as defaults
  - No rate limiting on login attempts
  - No admin audit trail
- Safe modification: Add password hashing immediately, implement rate limiting middleware
- Test coverage: No tests for admin auth scenarios

**Emergent Auth Integration:**
- Files: `frontend/src/context/AuthContext.jsx` (full file), `backend/server.py` (lines 397-470)
- Why fragile:
  - Hard dependency on external service
  - Session ID extraction from URL hash is fragile pattern
  - No offline mode
  - Error handling leaves user in auth limbo if session exchange fails
- Safe modification: This entire integration should be replaced - don't patch, migrate
- Test coverage: No integration tests for OAuth flow

**Course Category Auto-Detection:**
- Files: `backend/server.py` (lines 117-130, keyword matching logic)
- Why fragile: Keyword-based categorization easily misclassifies edge cases
- Example: "JavaScript" course gets classified as Computer Science (correct) but "Natural Philosophy" gets "General" (should be Philosophy)
- Test coverage: No unit tests validating categorization accuracy

---

## Scaling Limits

**MongoDB Queries Without Indexes:**
- Current capacity: Works fine with <1000 courses
- Limit: Course listing queries with `$or` and `$regex` will slow to seconds with 10k+ courses
- Scaling path: Add database indexes on `title`, `channelTitle`, `category`, `university` fields

**YouTube API Rate Limiting:**
- Current capacity: ~10,000 quota units per day (default for new projects)
- Limit: Single playlist import uses ~250 units. Adding 40 playlists = quota exhausted
- Scaling path: Implement quota management, queue imports, cache responses, use batch operations

**Frontend State Management:**
- Current capacity: 100-200 courses load and render without lag
- Limit: 1000+ courses will cause UI slowdown (no virtualization in course lists)
- Scaling path: Implement pagination/infinite scroll with `react-window`, implement SearchResults cursor-based pagination

**localStorage Limits:**
- Current capacity: ~5MB per domain (myList + watch progress objects)
- Limit: Beyond ~2000 courses in list
- Scaling path: Switch to IndexedDB, implement server-side watchlist storage

---

## Dependencies at Risk

**motor==3.3.1 (Async MongoDB Driver):**
- Risk: Outdated, PyMongo 4.5.0 is latest major version
- Impact: Missing performance improvements, security patches, type hints
- Migration plan: Update to latest motor version compatible with current MongoDB server

**fastapi==0.110.1:**
- Risk: Mid-range version from early 2024, security patches likely available
- Impact: Potential vulnerabilities in dependency resolution, routing
- Migration plan: Update to latest, test thoroughly for breaking changes in middleware

**React 19.0.0 with React Router 7.5.1:**
- Risk: Very recent versions (2024), may have undiscovered bugs, library ecosystem not fully compatible
- Impact: Compatibility issues with less-maintained UI libraries, potential React concurrent features unexpected behavior
- Migration plan: Monitor for bug reports, ensure all Radix UI components compatible

**Radix UI Collection (60+ packages):**
- Risk: Heavy dependency tree, each with its own versioning
- Impact: Security vulnerability in one Radix package affects entire app
- Migration plan: Monitor Dependabot alerts, implement dependency scanning CI

---

## Missing Critical Features

**Error Recovery:**
- Problem: If auth fails, network fails, or API returns 5xx, user has no way to retry or understand what went wrong
- Blocks: Cannot troubleshoot issues, cannot use app during partial outages
- Impact: Support tickets increase, user frustration

**Offline Mode:**
- Problem: App completely non-functional without backend connection
- Blocks: Cannot view cached courses or continue watching during outages
- Impact: Reduces utility for mobile/flaky connections

**Admin Audit Trail:**
- Problem: No logging of who added/deleted/modified courses, when, or why
- Blocks: Cannot investigate unauthorized changes, compliance failures
- Impact: No accountability, security investigation impossible

---

## Test Coverage Gaps

**YouTube API Integration - Untested:**
- What's not tested:
  - Playlist fetch with various video counts
  - Handling of restricted/age-gated videos
  - API error responses (quota exceeded, invalid ID, etc.)
  - Thumbnail fallback logic
- Files: `backend/server.py` (lines 242-328)
- Risk: Bugs in production during import, crashes without user feedback
- Priority: High - playlist import is primary feature

**Authentication Flow - No Integration Tests:**
- What's not tested:
  - Emergent Auth session exchange
  - Session expiry and refresh
  - Concurrent logins
  - Logout cleanup
- Files: `frontend/src/context/AuthContext.jsx`, `backend/server.py` (lines 397-490)
- Risk: Auth bugs lead to security issues or data loss
- Priority: High - security critical

**Admin Console - Untested:**
- What's not tested:
  - Course CRUD operations
  - Whitelist management
  - Category/University customization
  - Bulk import from channel
- Files: `frontend/src/pages/AdminPage.jsx` (1670 lines, complex UI state)
- Risk: Admin operations silently fail, data inconsistency
- Priority: Medium - impacts content management

**React Error Scenarios - No Tests:**
- What's not tested:
  - Network request errors
  - Invalid response data
  - Component render errors
  - State management edge cases
- Files: All `frontend/src/pages/*.jsx`
- Risk: Crashes and blank screens in production
- Priority: High - affects user experience

**Course Categorization - No Validation:**
- What's not tested:
  - Accuracy of auto-categorization
  - Edge cases (ambiguous keywords, special characters)
  - Performance on large titles
- Files: `backend/server.py` (lines 117-130)
- Risk: Poor category suggestions, bad UX
- Priority: Low - nice-to-have feature

---

*Concerns audit: 2026-03-30*
