# Codebase Structure

**Analysis Date:** 2026-03-30

## Directory Layout

```
EduStream-main/
├── frontend/                    # React SPA (Create React App with craco)
│   ├── src/
│   │   ├── App.js              # Root routing + HomePage component
│   │   ├── index.js            # React DOM mount point
│   │   ├── App.css             # Global styles
│   │   ├── index.css           # Base CSS with Tailwind directives
│   │   ├── pages/              # Page-level components (6 files)
│   │   ├── components/         # Reusable components (Navbar, CourseCard, etc.)
│   │   │   └── ui/             # shadcn/ui components (48 files)
│   │   ├── context/            # React Context providers (AuthContext)
│   │   ├── hooks/              # Custom React hooks (use-toast)
│   │   ├── lib/                # Utility functions (cn() for Tailwind merging)
│   │   ├── data/               # Mock data (mock.js)
│   │   └── public/             # Static assets (favicon, manifest)
│   ├── craco.config.js         # Create React App override config
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── postcss.config.js       # PostCSS configuration
│   ├── package.json            # npm dependencies (React 19, axios, recharts, etc.)
│   └── node_modules/           # Dependencies (not tracked in git)
│
├── backend/                     # FastAPI Python backend
│   ├── server.py               # Single monolithic backend (~1430 lines)
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables (MONGO_URL, API_KEYS)
│
├── .planning/                  # GSD planning documents (generated)
│   └── codebase/               # Analysis output
│
├── .git/                       # Git repository
├── .gitignore                  # Git ignore patterns
└── README.md                   # Project README
```

## Directory Purposes

**`frontend/src/`:**
- Purpose: All React source code
- Contains: Components, pages, context, utilities, styles
- Key files: `App.js` (routing), `index.js` (entry point), `context/AuthContext.jsx` (auth state)

**`frontend/src/pages/`:**
- Purpose: Page-level components (one per route)
- Contains: HomePage (in App.js), WatchPage, AdminPage, AuthPage, ProfilePage, MyCoursesPage
- Key files:
  - `WatchPage.jsx` - Video playback with YouTube iframe, module navigation, progress saving
  - `AdminPage.jsx` - Admin dashboard (71KB - largest page, includes all admin features)
  - `AuthPage.jsx` - OAuth sign-in redirect page
  - `ProfilePage.jsx` - User profile display
  - `MyCoursesPage.jsx` - User's saved courses view

**`frontend/src/components/`:**
- Purpose: Reusable UI components
- Contains: Application-specific components (Navbar, CourseCard, CourseRow, HeroSection, SearchResults, Footer, CinematicModal) + shadcn/ui library components
- Key files:
  - `Navbar.jsx` (15.7KB) - Fixed header with search, categories, user menu, mobile burger
  - `CourseCard.jsx` (11.5KB) - Course preview card with hover animations, video preview, progress bar
  - `CourseRow.jsx` - Horizontal scroll container for multiple CourseCards
  - `CinematicModal.jsx` - Full-screen course detail modal with play/add-to-list actions
  - `SearchResults.jsx` - Results view for search queries
  - `HeroSection.jsx` - Featured course showcase at page top
  - `Footer.jsx` - Footer with links
  - `MyListSection.jsx` - User's saved courses section

**`frontend/src/components/ui/`:**
- Purpose: shadcn/ui component library (headless Radix UI components styled with Tailwind)
- Contains: 48 pre-built components (button, dialog, dropdown-menu, form, toast, calendar, carousel, etc.)
- Usage: Import individual components as needed (tree-shakeable)

**`frontend/src/context/`:**
- Purpose: React Context for application-wide state
- Contains: `AuthContext.jsx` - Authentication state provider (user, isLoading, isAuthenticated, login/logout functions)
- Used by: Entire app via `useAuth()` hook

**`frontend/src/hooks/`:**
- Purpose: Custom React hooks
- Contains: `use-toast.js` - Toast notification system integration
- Used by: Components that trigger toast notifications (e.g., AdminPage)

**`frontend/src/lib/`:**
- Purpose: Utility libraries
- Contains: `utils.js` with `cn()` function (Tailwind class merging via clsx + tailwind-merge)
- Used by: All components applying conditional Tailwind classes

**`frontend/src/data/`:**
- Purpose: Static/mock data for development
- Contains: `mock.js` with sample courses, universities, categories
- Usage: Development/fallback data (rarely used since backend provides real data)

**`backend/server.py`:**
- Purpose: Entire FastAPI backend in single file
- Contains:
  - Models: User, UserSession, Course, Module, CourseCreate, CourseUpdate, ChannelFetch, AdminLoginRequest, WhitelistedChannelCreate, etc.
  - YouTube API helpers: extract_playlist_id(), format_duration(), fetch_playlist_details(), fetch_playlist_items(), fetch_video_details(), fetch_channel_playlists()
  - Auth endpoints: /auth/session, /auth/me, /auth/logout, /auth/admin/login
  - Course CRUD: POST /courses, GET /courses, GET /courses/{id}, PATCH /courses/{id}, DELETE /courses/{id}, POST /courses/{id}/refresh
  - Admin features: Channel fetching, whitelist management, category/university management, stats, recategorization
  - Search: YouTube search integration, auto-add from whitelisted channels
  - Database: MongoDB queries via Motor async driver

## Key File Locations

**Entry Points:**

- `frontend/src/index.js`: React application mount point (renders App component)
- `frontend/src/App.js`: Router setup, main HomePage component (446 lines)
- `backend/server.py` (lines 1417-1430): FastAPI app initialization, router registration, CORS middleware, shutdown handler

**Configuration:**

- `frontend/craco.config.js`: Create React App webpack overrides (path aliases, watch options, plugins)
- `frontend/tailwind.config.js`: Tailwind CSS theme extension (colors, animations, border radius)
- `frontend/postcss.config.js`: PostCSS plugin configuration (tailwindcss, autoprefixer)
- `backend/.env`: Environment variables (MONGO_URL, DB_NAME, YOUTUBE_API_KEY, ADMIN credentials)
- `frontend/.env.local` (not tracked): REACT_APP_BACKEND_URL pointing to backend server

**Core Logic:**

- `backend/server.py` (lines 49-132): CATEGORY_KEYWORDS dict + auto_categorize() function
- `backend/server.py` (lines 206-329): YouTube API helpers (fetch playlist, items, video details, channel playlists)
- `frontend/src/context/AuthContext.jsx`: OAuth flow, session management, user state
- `frontend/src/App.js` (lines 36-117): Course fetching, filtering, grouping logic
- `frontend/src/pages/WatchPage.jsx`: YouTube player initialization, error handling, progress tracking

**Testing:**

- `backend_test.py`: Backend integration tests (not in backend/ directory, at project root)
- `tests/`: Test directory (structure not detailed)
- Frontend: No test files found (Jest/React Testing Library not actively used)

## Naming Conventions

**Files:**

- Pages: PascalCase with `.jsx` extension (e.g., `WatchPage.jsx`, `AdminPage.jsx`)
- Components: PascalCase with `.jsx` extension (e.g., `CourseCard.jsx`, `Navbar.jsx`)
- Utilities/Hooks: camelCase with descriptive names (e.g., `use-toast.js`, `utils.js`)
- Styles: Component-scoped CSS or inline Tailwind classes (no global CSS per-component except App.css)
- Backend: snake_case for function names (e.g., `extract_playlist_id()`, `fetch_playlist_details()`)
- Backend models: PascalCase classes (e.g., `Course`, `Module`, `User`, `CourseCreate`)

**Directories:**

- Descriptive lowercase plural nouns: `pages/`, `components/`, `context/`, `hooks/`, `lib/`, `data/`
- Feature-based grouping: `components/ui/` for shadcn library

**Variables/Constants:**

- Frontend: camelCase for variables/functions, SCREAMING_SNAKE_CASE for constants (e.g., `BACKEND_URL`, `API`)
- Backend: snake_case for variables/functions, SCREAMING_SNAKE_CASE for constants (e.g., `MONGO_URL`, `YOUTUBE_API_KEY`)

## Where to Add New Code

**New Page Component:**
- Location: `frontend/src/pages/NewPageName.jsx`
- Add route in `frontend/src/App.js` Routes section
- Pattern: Accept props from router (useNavigate, useParams, useSearchParams), manage local state with useState/useEffect, fetch data if needed, render JSX
- Example: Check `frontend/src/pages/WatchPage.jsx` structure

**New Reusable Component:**
- Location: `frontend/src/components/NewComponentName.jsx`
- Pattern: Accept props (onPlay, onAddToList, data), manage internal state (hover, expanded), pass events up to parents
- Import shadcn/ui components from `./ui/` as needed
- Example: Check `frontend/src/components/CourseCard.jsx` structure

**New shadcn/UI Component:**
- Location: `frontend/src/components/ui/component-name.jsx`
- Already has 48 components - copy from shadcn/ui documentation
- Use Radix UI primitives with Tailwind styling

**Backend API Endpoint:**
- Location: `backend/server.py` (add to api_router)
- Pattern: Use @api_router.get/post/patch/delete decorator, async def handler, Pydantic models for request/response
- Database access: Use `await db.collection_name.find_one()`, `insert_one()`, `update_one()`, `delete_one()`
- Error handling: Raise HTTPException with status_code and detail message
- Example: Check `backend/server.py` lines 580-650 for POST /courses implementation

**New Database Collection:**
- Location: MongoDB accessed via `db.collection_name` in `backend/server.py`
- Existing collections: `users`, `user_sessions`, `courses`, `categories`, `universities`, `whitelisted_channels`
- Pattern: Define Pydantic model first, then use in route handlers

**Utility Function:**
- Frontend: Add to `frontend/src/lib/utils.js` or create new file in `lib/`
- Backend: Add helper functions before route handlers in `backend/server.py`
- Example: `format_duration()`, `extract_playlist_id()` utility functions

**Context/State Provider:**
- Location: `frontend/src/context/ContextName.jsx`
- Pattern: createContext → useContext hook → Provider component
- Example: `AuthContext.jsx` (lines 9-164)

## Special Directories

**`frontend/node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (npm install)
- Committed: No (in .gitignore)
- Size: Large (~700MB+)

**`frontend/public/`:**
- Purpose: Static assets served directly by web server
- Generated: No
- Committed: Yes
- Contains: favicon, manifest.json, robots.txt, index.html

**`frontend/build/`:**
- Purpose: Production build output from `npm run build`
- Generated: Yes (craco build)
- Committed: No (in .gitignore)

**`backend/.env`:**
- Purpose: Environment variables (secrets, API keys, database URLs)
- Generated: No (manually created)
- Committed: No (never commit .env files)
- Required vars: MONGO_URL, DB_NAME, YOUTUBE_API_KEY, ADMIN_USERNAME, ADMIN_PASSWORD

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents (auto-generated)
- Generated: Yes (by GSD commands)
- Committed: Yes (part of planning artifacts)

---

*Structure analysis: 2026-03-30*
