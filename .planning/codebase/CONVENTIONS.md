# Coding Conventions

**Analysis Date:** 2026-03-30

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `Navbar.jsx`, `CourseCard.jsx`, `AuthPage.jsx`)
- Utility files: camelCase (e.g., `utils.js`, `use-toast.js`)
- Context files: NameContext pattern (e.g., `AuthContext.jsx`)
- UI component library: lowercase with hyphens (e.g., `dialog.jsx`, `toggle-group.jsx`)
- Python modules: snake_case (e.g., `server.py`)
- Python classes: PascalCase (e.g., `User`, `Course`, `Module`, `AdminLoginRequest`)

**Functions:**
- Frontend (JavaScript): camelCase (e.g., `handleSearchChange`, `formatCourseDuration`, `clearSearch`, `getInstructor`)
- Python: snake_case (e.g., `auto_categorize`, `extract_playlist_id`, `fetch_playlist_details`, `create_session`)
- React hooks: useXxx pattern (e.g., `useAuth`, `useNavigate`, `useLocation`)

**Variables:**
- JavaScript: camelCase (e.g., `selectedCategory`, `isScrolled`, `searchQuery`, `hoverTimeoutRef`)
- Python: snake_case (e.g., `session_token`, `playlist_id`, `video_ids`)
- State variables: prefixed with `is`, `has`, `show`, `are` for booleans (e.g., `isLoading`, `showSearch`, `isAuthenticated`)

**Types:**
- Python Pydantic models: PascalCase (e.g., `User`, `Course`, `Module`, `CourseCreate`, `CourseUpdate`)
- TypeScript/JSDoc: not heavily used, minimal type annotations in frontend

## Code Style

**Formatting:**
- No explicit linter config file found (no `.eslintrc`, `.prettierrc`, `biome.json`)
- Indentation: 2 spaces for JavaScript/JSX, 4 spaces for Python
- Line length: No strict limit enforced, but generally compact

**Linting:**
- Backend Python tools configured in `requirements.txt`: black, isort, flake8, mypy (not actively enforced in git)
- Frontend: ESLint and eslint plugins are devDependencies but no config file present

## Import Organization

**Order:**
1. React/core library imports first
2. Third-party library imports (lucide-react icons, react-router-dom)
3. Context/custom hooks imports
4. Component imports
5. Utility imports
6. CSS imports

**Examples from codebase:**
```javascript
// From Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, X, Menu, User, BookOpen, LogOut, Settings, LogIn, List, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
```

```python
# From server.py
from fastapi import FastAPI, APIRouter, HTTPException, Query, Request, Response, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
```

**Path Aliases:**
- Frontend uses `@/` alias for `src/` directory (e.g., `import "@/index.css"`, `import { cn } from "@/lib/utils"`)

## Error Handling

**Patterns:**

Frontend error handling uses try/catch with console.error logging:
```javascript
// From App.js
try {
  const response = await fetch(`${API}/courses`);
  const data = await response.json();
  setCourses(data);
} catch (err) {
  console.error("Failed to fetch courses:", err);
}
```

Backend error handling uses FastAPI HTTPException:
```python
# From server.py
if not session_id:
    raise HTTPException(status_code=400, detail="session_id required")

if response.status_code != 200:
    raise HTTPException(status_code=401, detail="Invalid session_id")

# Query error handling
if not data.get('items'):
    raise HTTPException(status_code=404, detail="Playlist not found")
```

**Error strategies:**
- Frontend: Silent failures logged to console, no user-facing error UI framework found
- Backend: HTTP status codes (400, 401, 403, 404) mapped to error conditions
- Backend: Specific error messages in HTTPException detail fields

## Logging

**Framework:**
- Frontend: console (console.log, console.error)
- Backend: Python logging module (configured in `server.py`)

**Patterns:**

Frontend logging:
```javascript
console.log('OAuth callback detected with session_id in hash:', sessionId);
console.error('Auth check failed:', err);
console.log('Auth check successful:', userData);
```

Backend logging:
```python
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Usage
logger.error(f"Failed to import playlist {playlist_id}: {e}")
```

## Comments

**When to Comment:**
- Architectural notes: e.g., "DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH" (from AuthContext.jsx)
- Section headers with ==== dividers for logical code sections (e.g., `# ============ AUTO-CATEGORIZATION ============`)
- Inline comments for non-obvious logic
- Function docstrings in Python (e.g., `"""Auto-categorize course based on title and description keywords"""`)

**JSDoc/TSDoc:**
- Minimal usage in frontend
- Python has basic function docstrings in utility functions

**Example from backend:**
```python
async def fetch_playlist_details(playlist_id: str) -> dict:
    """Fetch playlist metadata from YouTube API"""
```

## Function Design

**Size:**
- React components: 100-300 lines typical (e.g., `Navbar.jsx` ~300 lines, `CourseCard.jsx` ~200 lines)
- Python async functions: 20-50 lines typical for API endpoints
- Utility functions: 5-30 lines

**Parameters:**
- Frontend: Props passed as single destructured object
  ```javascript
  const CourseCard = ({ course, onPlay, onAddToList, isInList, onOpenModal, isExpanded = false, progress = null }) => {
  ```
- Backend: Pydantic model validation for POST bodies, query parameters with type hints
  ```python
  async def get_courses(
      skip: int = 0,
      limit: int = 100,
      featured: bool = Query(None),
      category: str = Query(None),
      university: str = Query(None)
  ):
  ```

**Return Values:**
- JavaScript components: JSX elements (implicit return)
- JavaScript functions: objects, arrays, promises
- Python: dict (converted to JSON), Pydantic models, HTTPException on error

## Module Design

**Exports:**
- React components: default export (e.g., `export default Navbar;`)
- Utilities: named exports (e.g., `export function cn(...inputs) { ... }`)
- Contexts: named exports for provider and hook (e.g., `export const useAuth`, `export const AuthProvider`)

**Barrel Files:**
- UI components imported directly from individual files (e.g., `import { Button } from "@/components/ui/button.jsx"`)
- No barrel index files found in ui/ directory

## Constants

**Frontend:**
- Environment variables: `process.env.REACT_APP_*` pattern (e.g., `process.env.REACT_APP_BACKEND_URL`)
- API base URL: derived from env variable
  ```javascript
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;
  ```
- Static option arrays defined as module-level constants
  ```javascript
  const UNIVERSITY_OPTIONS = [
    { id: 'mit', name: 'MIT OpenCourseWare' },
    ...
  ];
  ```

**Backend:**
- Environment-driven configuration: `os.environ.get()` pattern
- Category keywords: module-level dictionary `CATEGORY_KEYWORDS`
- API base URLs: `YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'`

## State Management

**Frontend:**
- React Context API for authentication state (`AuthContext.jsx`)
- Local component state with `useState`
- localStorage for persistence (e.g., `edustream-mylist`, `edustream-progress`, `edustream_user`)
- Refs for imperative values (e.g., `hoverTimeoutRef`, `searchInputRef`)

**Backend:**
- MongoDB for persistent data (User, Course, UserSession collections)
- No in-memory state management

---

*Convention analysis: 2026-03-30*
