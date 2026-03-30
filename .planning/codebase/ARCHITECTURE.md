# Architecture

**Analysis Date:** 2026-03-30

## Pattern Overview

**Overall:** Full-stack client-server streaming application with monolithic backend and componentized React frontend

**Key Characteristics:**
- Frontend: React SPA (Create React App with craco) using React Router for navigation
- Backend: Monolithic FastAPI application (~1430 lines in single server.py file)
- State Management: Context API (AuthContext) for authentication; React local state for UI state; localStorage for persistence
- Communication: REST API calls via fetch() from frontend to backend
- Data Layer: MongoDB with Motor async driver
- External Integration: YouTube Data API v3 for content ingestion, Emergent Auth for OAuth

## Layers

**Presentation Layer (Frontend):**
- Purpose: User-facing React components, routing, and UI state management
- Location: `/frontend/src/`
- Contains: Page components, UI components (shadcn/ui), context providers, hooks
- Depends on: React Router, React Hook Form, Axios/fetch, Tailwind CSS, Radix UI, Lucide icons
- Used by: Web browsers via React dev server or build artifacts

**API Layer (Backend):**
- Purpose: RESTful API endpoints for course management, authentication, admin operations
- Location: `/backend/server.py`
- Contains: FastAPI route handlers, request/response models (Pydantic), auth middleware
- Depends on: FastAPI, Pydantic, MongoDB, YouTube API, Emergent Auth
- Used by: Frontend via HTTP requests, admin UI operations

**Data Layer (Backend):**
- Purpose: MongoDB collections for users, courses, sessions, categories, whitelist
- Location: MongoDB database accessed via Motor async driver
- Contains: Collections - `users`, `user_sessions`, `courses`, `categories`, `universities`, `whitelisted_channels`
- Depends on: MongoDB Atlas/local instance, motor async client
- Used by: FastAPI route handlers for CRUD operations

**External Services:**
- YouTube API: Fetch playlist metadata, video details, channel information
- Emergent Auth: OAuth provider for user authentication
- MongoDB Atlas: Cloud database storage

## Data Flow

**Course Browsing:**

1. User navigates to home page → Frontend fetches `/api/courses`
2. Backend queries MongoDB `courses` collection
3. Returns course list with modules, metadata, thumbnails
4. Frontend renders CourseRow components with CourseCard children
5. CourseCard displays thumbnail, shows YouTube preview on hover (iframe)
6. User clicks course → opens CinematicModal with details or clicks Play button

**Course Playback:**

1. User clicks Play → navigates to `/watch/:courseId?module=0`
2. WatchPage fetches `/api/courses/{courseId}` for full course data
3. Renders YouTube iframe embed for current module video
4. Player saves progress to localStorage on every module change
5. YouTube IFrame API detects onStateChange event (video ended) → auto-plays next module
6. On error (e.g., embedding disabled), sets `videoRestricted` flag → shows fallback UI

**Admin Course Addition:**

1. Admin navigates to `/edusigninup` → AdminPage
2. Admin logs in via `/api/auth/admin/login` (username/password)
3. Form accepts YouTube playlist URL → backend extracts playlist ID
4. Backend calls `/api/courses` POST with CourseCreate payload
5. Backend fetches playlist details from YouTube API (snippet, contentDetails)
6. Fetches all playlist items (videos) via YouTube playlistItems endpoint
7. For each video, fetches video details (duration) via YouTube videos endpoint
8. Builds Module objects with videoId, duration, thumbnail, title
9. Auto-categorizes course using keyword matching (CATEGORY_KEYWORDS dict)
10. Stores full Course object in MongoDB
11. Returns created course to frontend

**User Authentication (OAuth):**

1. User clicks "Sign in" → AuthContext.login()
2. Redirects to `EMERGENT_AUTH_URL` with redirect parameter
3. User authenticates with Emergent Auth provider
4. Provider redirects back with `session_id` in URL fragment
5. AuthContext intercepts via hash parsing
6. Calls `/api/auth/session` POST with `session_id`
7. Backend validates session_id with Emergent Auth service
8. Creates/updates user in MongoDB `users` collection
9. Generates session_token, stores in `user_sessions` collection
10. Sets `session_token` as httpOnly cookie
11. Frontend stores user data in localStorage as backup
12. Subsequent requests include session_token in cookies (auto-sent)

**Search & Filtering:**

1. User types in Navbar search → triggers `handleSearch()` in HomePage
2. Frontend filters in-memory courses array by title, channelTitle, category, universityName
3. No backend call for search - client-side filtering only
4. Shows results in SearchResults component
5. Category pills in navbar filter courses by category (client-side)

**State Management:**

- **AuthContext (`/frontend/src/context/AuthContext.jsx`):** Manages `user`, `isLoading`, `isAuthenticated`, `error`, login/logout functions. Persists to localStorage and httpOnly cookies.
- **HomePage Local State:** `courses[]`, `categories[]`, `selectedCategory`, `myList[]`, `searchResults`, `watchProgress{}`, `selectedCourse`. Persists myList and watchProgress to localStorage.
- **WatchPage Local State:** `course`, `currentModuleIndex`, `showControls`, `showEpisodes`, `videoRestricted`, `restrictedVideos`. Persists progress to localStorage.
- **AdminPage Local State:** `courses[]`, `activeTab`, form states for add/edit/import modals, `stats`, `whitelist`, `universities`, `categories`.

## Key Abstractions

**Course Object:**
- Purpose: Represents an educational video course sourced from YouTube playlist
- Examples: `src/App.js` (useState, handlePlay), `src/pages/WatchPage.jsx` (course fetch/display), `src/components/CourseCard.jsx` (progress calculation)
- Pattern: Pydantic BaseModel `Course` with Module children. Contains: id, title, description, playlistId, modules[], university, category, featured, thumbnail, rating, quality, videoCount, createdAt, updatedAt

**Module Object:**
- Purpose: Individual video within a Course
- Examples: `backend/server.py` lines 151-157
- Pattern: Pydantic BaseModel with id (uuid), title, videoId (YouTube), duration (formatted string), position, thumbnail

**Session/Authentication:**
- Purpose: Track authenticated user across requests
- Examples: `src/context/AuthContext.jsx`, `backend/server.py` lines 342-479
- Pattern: httpOnly cookie (`session_token`) + User document in MongoDB. Session expiry 7 days.

**Category/University:**
- Purpose: Organize courses hierarchically
- Examples: `backend/server.py` lines 51-116 (CATEGORY_KEYWORDS), AdminPage for management
- Pattern: Auto-categorization via keyword scoring; custom categories managed by admins

## Entry Points

**Frontend:**
- Location: `src/index.js`
- Triggers: Browser loads application
- Responsibilities: Mounts React root, wraps app in StrictMode, renders App component

**Backend:**
- Location: `backend/server.py` (bottom of file - app.include_router, middleware setup)
- Triggers: `uvicorn main:app` command
- Responsibilities: Registers API router, sets up CORS middleware, database connection, shutdown handler

**Home Page (SPA root):**
- Location: `src/App.js` HomePage component (lines 22-446)
- Triggers: URL path `/`
- Responsibilities: Fetch courses, render hero section, course rows, handle search/filtering/playback

**Admin Page:**
- Location: `src/pages/AdminPage.jsx`
- Triggers: URL path `/edusigninup`, auth check: user.is_admin
- Responsibilities: Admin login, course CRUD, whitelist management, stats display

**Watch Page:**
- Location: `src/pages/WatchPage.jsx`
- Triggers: URL path `/watch/:courseId`
- Responsibilities: Fetch course, render YouTube player, handle module navigation, save progress

## Error Handling

**Strategy:** Client-side alerts via try-catch + state error flags; backend returns HTTPException with status codes and error messages

**Patterns:**

1. **Frontend API Calls:**
   ```javascript
   try {
     const response = await fetch(`${API}/courses`);
     if (!response.ok) throw new Error('Failed');
     const data = await response.json();
   } catch (err) {
     console.error(err);
     setError(err.message);
   }
   ```

2. **YouTube Embed Errors (WatchPage):**
   - Detects error codes 101, 150 (embedding disabled), 5 (HTML5 error)
   - Sets `videoRestricted` flag
   - Shows fallback message instead of broken iframe

3. **Backend HTTP Errors:**
   - Invalid playlist ID → HTTPException 400
   - Playlist not found → HTTPException 404
   - Unauthorized admin → HTTPException 403
   - Session expired → HTTPException 401

4. **Database Errors:**
   - Wrapped in try-catch within async functions
   - Returns 500 error with generic message

## Cross-Cutting Concerns

**Logging:**
- Backend: Python `logging` module (stdout) - logs playlist fetches, OAuth callbacks, admin actions, errors
- Frontend: `console.log()` for OAuth flow, YouTube player errors, auth checks (development only)

**Validation:**
- Backend: Pydantic models validate all request bodies (CourseCreate, CourseUpdate, AdminLoginRequest, ChannelFetch, etc.)
- Frontend: React Hook Form with Zod validators (limited use - mostly form inputs in AdminPage). HTML5 form validation on search inputs.

**Authentication:**
- Frontend: AuthContext manages user state, redirects to login if needed, checks isAuthenticated before showing admin routes
- Backend: `get_current_user()` dependency extracts session_token from cookies/headers; `require_auth()` enforces 401 if missing; `require_admin()` enforces 403 if not is_admin flag

**CORS:**
- Backend: Middleware allows requests only from `http://localhost:3001` and `http://127.0.0.1:3001` (development only)
- Credentials allowed (includes cookies in cross-origin requests)

**Persistence:**
- Browser localStorage: `edustream-mylist` (course IDs), `edustream-progress` (watch progress per course), `edustream_user` (backup user data)
- MongoDB: All persistent data (users, courses, sessions, categories, whitelist)

---

*Architecture analysis: 2026-03-30*
