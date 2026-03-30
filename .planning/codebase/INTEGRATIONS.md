# External Integrations

**Analysis Date:** 2026-03-30

## APIs & External Services

**YouTube Data API v3:**
- Purpose: Search for playlists, fetch video details, channel information, playlist metadata
- SDK/Client: httpx (async HTTP client) in `backend/server.py`
- Auth: API Key via `YOUTUBE_API_KEY` environment variable
- Base URL: `https://www.googleapis.com/youtube/v3`
- Endpoints Used:
  - `GET /playlists` - Fetch playlist metadata (title, description, thumbnails)
  - `GET /playlistItems` - Fetch videos in a playlist (with pagination)
  - `GET /videos` - Fetch video details (duration, metadata)
  - `GET /channels` - Fetch channel information
  - `GET /search` - Search for channels by handle/name
- Key Functions:
  - `fetch_playlist_details()` - Line ~242
  - `fetch_playlist_items()` - Line ~263
  - `fetch_video_details()` - Line ~293
  - `fetch_channel_playlists()` - Line ~311
  - YouTube search endpoints in `/search/youtube` routes
- Implementation Details: Uses async httpx.AsyncClient for non-blocking requests
- Error Handling: HTTP exceptions return YouTube API error messages when requests fail

**Emergent Auth (OAuth Session Validation):**
- Purpose: Validate user sessions for educational institution authentication
- Service URL: `https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data`
- Auth: Session ID passed in request to validate
- Endpoint: `POST /auth/session` in `backend/server.py` (line ~397)
- Integration Flow:
  1. Frontend sends `session_id` from Emergent Auth
  2. Backend validates session against Emergent Auth URL
  3. Creates internal `session_token` for API authentication
  4. Returns session cookie to frontend
- Related Code: Authentication middleware and session management in `backend/server.py`

## Data Storage

**Database: MongoDB**
- Type: NoSQL document database
- Connection: Via `motor.motor_asyncio.AsyncIOMotorClient` (async driver)
- Environment Variable: `MONGO_URL` - Connection string
- Database Name: `DB_NAME` environment variable
- Collections Used:
  - `users` - User documents with fields: `user_id`, `email`, `name`, `picture`, `is_admin`, `created_at`
  - `user_sessions` - Session tokens with: `user_id`, `session_token`, `expires_at`, `created_at`
  - `courses` - Course data with: `id`, `title`, `description`, `playlistId`, `channelId`, `university`, `category`, `modules` (array), `rating`, `featured`, `createdAt`
  - `modules` (nested in courses) - Individual video items with: `id`, `title`, `videoId`, `duration`, `position`, `thumbnail`
  - `custom_universities` - User-created university entries
  - `custom_categories` - User-created course categories with keywords for auto-categorization
  - `whitelist_channels` - Whitelisted YouTube channels with institution associations
- ORM/Client: Motor 3.3.1 (async MongoDB driver)
- Usage Pattern: All database operations are async with `await` in `backend/server.py`

**File Storage:**
- Approach: No persistent file storage integration detected
- Current: Uses YouTube thumbnail URLs directly (no local storage)
- Video files: Streamed from YouTube (via playlist/video playback)

**Caching:**
- Strategy: No explicit caching layer detected
- Current: Data fetched fresh from MongoDB and YouTube API on each request
- Opportunity: Could implement Redis caching for frequently accessed courses/playlists

## Authentication & Identity

**Auth Provider:**
- Strategy: Custom authentication with external session validation
- Emergent Auth Integration: OAuth session validation via `EMERGENT_AUTH_URL`
  - Location: `backend/server.py` line ~34
  - Validates institutional credentials

**Implementation Details:**
- JWT/Session Token System:
  - Session tokens created in `POST /auth/session` endpoint (line ~397)
  - Tokens stored in `user_sessions` collection with expiry
  - Authentication middleware: `get_current_user()` function (line ~342)
    - Checks for `session_token` in cookies or `Authorization: Bearer` header
    - Validates token exists in database and hasn't expired
  - Admin authentication: `require_admin()` function (line ~388)
    - Checks user's `is_admin` flag in users collection
- Credential Requirements:
  - Admin login: `ADMIN_USERNAME` and `ADMIN_PASSWORD` from environment variables
  - Default credentials: 'EduADLogin' / 'P1usD@pper@#stream' (overridable via env vars)
  - Logout: Removes session token via `POST /auth/logout`
  - Session Check: `POST /auth/me` and `GET /auth/session` endpoints

**Frontend Authentication:**
- Location: `frontend/src/context/AuthContext.jsx`
- Mechanism: Fetch-based API calls to backend auth endpoints
- Session Management:
  - Login flow: Exchanges Emergent Auth session for internal session token
  - Cookie handling: Session token stored as HTTP cookie
  - Auto-logout on expiry

## Monitoring & Observability

**Error Tracking:**
- Strategy: No external error tracking service detected
- Current: Python logging to console via `logging` module in `backend/server.py` (line ~43)
- Logging Configuration:
  - Level: INFO
  - Format: `'%(asctime)s - %(name)s - %(levelname)s - %(message)s'`
  - Logger instance: `logger = logging.getLogger(__name__)`

**Logs:**
- Backend: Console logging (INFO level) for API operations
  - Sample: Auto-add course logging (line ~1119)
  - Error logging for failed operations
- Frontend: No formal logging; uses `console.error()` for debugging
- Deployment: Logs would be captured by application container/process manager

**Health Checks:**
- Frontend: Health check endpoints conditionally loaded via craco config
  - Enabled via `ENABLE_HEALTH_CHECK` environment variable
  - Health plugin: `WebpackHealthPlugin` from `plugins/health-check/`
- Backend: `GET /api/health` endpoint (line ~336)
  - Returns: `{"status": "healthy", "youtube_api": bool}`
  - Checks YouTube API key availability

## CI/CD & Deployment

**Hosting:**
- Not yet determined (project structure suggests local development)
- Frontend: Can be deployed to any static host or Node.js server
- Backend: Requires Python 3.x + Uvicorn ASGI server

**CI Pipeline:**
- No CI/CD configuration detected (no .github/workflows, .gitlab-ci.yml, etc.)
- Manual deployment required

**Development Servers:**
- Frontend: `yarn start` runs Craco dev server on default port (typically 3000 or 3001)
- Backend: FastAPI dev server via `uvicorn backend.server:app --reload` (typically port 8000, configured as 8001 in frontend env)

## Environment Configuration

**Required Environment Variables:**

**Frontend (.env):**
- `REACT_APP_BACKEND_URL` - Backend API base URL (default: `http://localhost:8001`)

**Backend (.env):**
- `MONGO_URL` - MongoDB connection string (format: `mongodb://...` or `mongodb+srv://...`)
- `DB_NAME` - MongoDB database name
- `YOUTUBE_API_KEY` - YouTube Data API v3 API key
- `ADMIN_USERNAME` - Admin login username (default: 'EduADLogin')
- `ADMIN_PASSWORD` - Admin login password (default: 'P1usD@pper@#stream')

**Optional/Development:**
- `ENABLE_HEALTH_CHECK` - Enable health check endpoints in frontend (set to `"true"`)
- `NODE_ENV` - Set to "production" for production builds (Craco automatically sets)

## CORS Configuration

**Backend CORS Middleware:**
- Location: `backend/server.py` line ~1418
- Configured for:
  - `allow_origins`: `["http://localhost:3001", "http://127.0.0.1:3001"]`
  - `allow_credentials`: `True` (allow cookies/auth headers)
  - `allow_methods`: `["*"]` (all HTTP methods)
  - `allow_headers`: `["*"]` (all headers)
- **Note for Production:** CORS origins must be updated to production domain

## API Structure

**Base URL:** `http://localhost:8001/api` (default local development)

**Route Categories:**

**Authentication Routes:**
- `POST /api/auth/session` - Create session from Emergent Auth session_id
- `POST /api/auth/me` - Get current authenticated user
- `GET /api/auth/session` - Get current session data
- `POST /api/auth/logout` - Logout and invalidate session
- `POST /api/auth/admin/login` - Admin-specific login

**Course Management:**
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course from YouTube playlist
- `GET /api/courses/{courseId}` - Get course details
- `PATCH /api/courses/{courseId}` - Update course
- `DELETE /api/courses/{courseId}` - Delete course
- `POST /api/courses/{courseId}/refresh` - Refresh course from YouTube

**YouTube Integration:**
- `GET /api/search/youtube?q=query` - Search YouTube playlists
- `POST /api/search/youtube/add` - Quick-add playlist from search
- `GET /api/whitelist/resolve?url=` - Resolve YouTube URL to channel/playlist ID
- `POST /api/channels/import` - Bulk import playlists from channel

**Admin Management:**
- `GET /api/whitelist` - Get whitelisted channels
- `POST /api/whitelist` - Add channel to whitelist
- `DELETE /api/whitelist/{channel_id}` - Remove from whitelist
- `GET /api/admin/universities` - Get all universities (default + custom)
- `POST /api/admin/universities` - Add custom university
- `DELETE /api/admin/universities/{uni_id}` - Delete custom university
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Add custom category
- `DELETE /api/admin/categories/{name}` - Delete custom category

**Statistics:**
- `GET /api/stats` - Get platform statistics

## Webhooks & Callbacks

**Incoming:**
- No incoming webhooks detected

**Outgoing:**
- No outgoing webhooks detected
- All integrations are request/response based (REST API pattern)

---

*Integration audit: 2026-03-30*
