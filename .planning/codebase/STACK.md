# Technology Stack

**Analysis Date:** 2026-03-30

## Languages

**Frontend:**
- JavaScript (ES6+) - React/JSX components in `src/components/`, `src/pages/`
- CSS 3 - Styling in `src/App.css`, `src/index.css`

**Backend:**
- Python 3.x - FastAPI application in `server.py`

## Runtime

**Frontend:**
- Node.js - JavaScript runtime for React CRA development
- Package Manager: Yarn 1.22.22 (specified in `package.json` packageManager field)
- Lockfile: `yarn.lock` present

**Backend:**
- Python 3.x - Async runtime via uvicorn ASGI server
- Package Manager: pip (dependencies in `requirements.txt`)

## Frameworks

**Frontend:**
- React 19.0.0 - UI library (`react`, `react-dom` in `frontend/package.json`)
- React Router 7.5.1 - Client-side routing (`react-router-dom`)
- Create React App (CRA) with Craco - Build toolchain
  - Build tool: Craco 7.1.0 (custom webpack configuration in `craco.config.js`)
  - Entry point: `src/index.js`
  - Build output: Standard CRA output structure

**Backend:**
- FastAPI 0.110.1 - REST API framework in `backend/server.py`
- Uvicorn 0.25.0 - ASGI server for async request handling
- Motor 3.3.1 - Async MongoDB driver for database operations

**UI Components:**
- Radix UI (v1.1-v2.2) - Headless component library with 20+ component libraries
  - Accordion, Alert Dialog, Avatar, Checkbox, Collapsible, Context Menu, Dialog, Dropdown Menu, Hover Card, Label, Menubar, Navigation Menu, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Slider, Slot, Switch, Tabs, Toast, Toggle, Toggle Group, Tooltip
- shadcn/ui - Built on Radix UI with Tailwind CSS (configured in `components.json`)

**Styling & Theming:**
- Tailwind CSS 3.4.17 - Utility-first CSS framework
  - Config: `tailwind.config.js` with custom theme extensions
  - Dark mode: Class-based (`darkMode: ["class"]`)
  - Color system: CSS variables for dynamic theming (--background, --foreground, --card, --primary, --secondary, etc.)
- PostCSS 8.4.49 - CSS processing (configured in `postcss.config.js`)
- Autoprefixer 10.4.20 - Vendor prefix handling
- Tailwind CSS Animate 1.0.7 - Animation utilities
- Tailwind Merge 3.2.0 - Merge Tailwind class conflicts

**Form Handling:**
- React Hook Form 7.56.2 - Performant form management
- @hookform/resolvers 5.0.1 - Schema validation integration
- Zod 3.24.4 - TypeScript-first schema validation

**UI Utilities & Components:**
- Lucide React 0.507.0 - Icon library (SVG icons)
- Sonner 2.0.3 - Toast notifications
- Embla Carousel React 8.6.0 - Carousel component
- React Day Picker 8.10.1 - Date picker component
- React Resizable Panels 3.0.1 - Resizable panel layouts
- Cmdk 1.1.1 - Command menu component
- Input OTP 1.4.2 - OTP input component
- Vaul 1.1.2 - Drawer/modal component
- Class Variance Authority 0.7.1 - Component variant management
- clsx 2.1.1 - Conditional className utility

**Data Visualization:**
- Recharts 3.6.0 - React charting library for stats/analytics

**Utilities:**
- Date-fns 4.1.0 - Date utility library
- Axios 1.8.4 - HTTP client (though mostly using native fetch in current code)

## Development & Build Tools

**Frontend:**
- ESLint 9.23.0 - Code linting
  - Plugins: react (7.37.4), react-hooks (5.2.0), jsx-a11y (6.10.2), import (2.31.0)
  - Config: Craco-integrated via `craco.config.js`
- Babel 7.x - JavaScript transpilation
  - Plugin: @babel/plugin-proposal-private-property-in-object (7.21.11)
- React Scripts 5.0.1 - CRA webpack configuration
- @craco/craco 7.1.0 - Craco CLI for custom CRA configuration

**Backend:**
- Black 24.1.1 - Python code formatter
- isort 5.13.2 - Python import organizer
- Flake8 7.0.0 - Python linter
- mypy 1.8.0 - Static type checker for Python
- Pytest 8.0.0 - Testing framework
- Typer 0.9.0 - CLI framework for Python
- jq 1.6.0 - JSON query tool

## Key Dependencies

**Backend Async & HTTP:**
- httpx 0.27.0 - Async HTTP client for external API calls (YouTube API, Emergent Auth)
- requests 2.31.0 - Synchronous HTTP library
- requests-oauthlib 2.0.0 - OAuth authentication support

**Backend Security & Crypto:**
- cryptography 42.0.8 - Cryptographic algorithms
- PyJWT 2.10.1 - JWT token creation/validation
- passlib 1.7.4 - Password hashing
- python-jose 3.3.0 - JOSE/JWT implementation
- email-validator 2.2.0 - Email validation

**Backend Database:**
- pymongo 4.5.0 - MongoDB client (deprecated in favor of Motor for async)
- motor 3.3.1 - Async MongoDB driver (primary async driver)
- pydantic 2.6.4 - Data validation and serialization

**Backend Environment & Config:**
- python-dotenv 1.0.1 - Environment variable management
- python-multipart 0.0.9 - Multipart form data parsing

**Backend Data Processing:**
- pandas 2.2.0 - Data manipulation and analysis
- numpy 1.26.0 - Numerical computing

**Backend Utilities:**
- tzdata 2024.2 - Timezone database

**AWS (Optional):**
- boto3 1.34.129+ - AWS SDK (in requirements but not actively used in visible code)

**Frontend HTTP:**
- fetch API (native) - Primary HTTP client for API calls in `src/context/AuthContext.jsx`, `src/pages/WatchPage.jsx`, etc.

## Configuration Files

**Frontend:**
- `frontend/package.json` - Dependencies and build scripts
- `frontend/craco.config.js` - Webpack and Babel configuration overrides
  - Aliases: `@` → `src/` path resolution
  - ESLint rules for React hooks
  - Watch optimization (ignores node_modules, .git, build, dist, coverage)
- `frontend/jsconfig.json` - JavaScript compiler options
  - Base URL: `.`
  - Path alias: `@/*` → `src/*`
- `frontend/tailwind.config.js` - Tailwind CSS theming and customization
  - Color system with CSS variables
  - Dark mode class strategy
  - Animation keyframes for accordion
- `frontend/postcss.config.js` - PostCSS configuration
- `frontend/components.json` - shadcn/ui configuration
  - Style: "new-york"
  - Tailwind config reference
  - Component aliases (components, ui, utils, lib, hooks)
  - Icon library: lucide

**Frontend Environment:**
- `.env` - Environment variables (API endpoint configured here)
  - `REACT_APP_BACKEND_URL=http://localhost:8001`

**Backend:**
- `backend/requirements.txt` - Python package dependencies
- `backend/.env` - Environment variables (present but not readable)
  - Expected vars: `MONGO_URL`, `DB_NAME`, `YOUTUBE_API_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`

## Platform Requirements

**Development:**
- Node.js with Yarn 1.22.22
- Python 3.x
- MongoDB instance (local or remote via `MONGO_URL`)
- YouTube API Key (for playlist/video data)
- Valid YouTube API quota

**Production:**
- Node.js 18+ (for React 19 support)
- Python 3.8+
- MongoDB Atlas or self-hosted MongoDB
- Uvicorn ASGI server or similar Python async server
- Environment variables configured per deployment platform
- CORS configuration for production frontend domain

## Browser Support

**Production browsers:**
- >0.2% market share
- Not dead browsers
- Not Opera Mini

**Development browsers:**
- Latest Chrome version
- Latest Firefox version
- Latest Safari version

---

*Stack analysis: 2026-03-30*
