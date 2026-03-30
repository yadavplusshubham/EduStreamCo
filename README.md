<div align="center">

# EduStream

**Open-source Netflix-style platform for free university lectures**

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](docker-compose.yml)
[![Live Demo](https://img.shields.io/badge/Live-edustream.co.in-red)](https://edustream.co.in)

Stream 900+ free lectures from MIT, Stanford, Yale, Harvard and more — beautifully organized, fully searchable, completely free.

[Live Demo](https://edustream.co.in) · [Report Bug](https://github.com/yadavplusshubham/EdustreamCo/issues/new?template=bug_report.md) · [Request Feature](https://github.com/yadavplusshubham/EdustreamCo/issues/new?template=feature_request.md)

</div>

---

## Why EduStream?

World-class university lectures exist on YouTube — but they're buried, unorganized, and invisible to search engines. EduStream fixes that:

- **SSR with Next.js 15** — every course page is server-rendered with full metadata, making it indexable by Google
- **Netflix-style UI** — familiar, cinematic browsing experience for educational content
- **No account required** — completely open access, no sign-up wall
- **Self-hostable** — run locally in minutes or deploy to any VPS; Docker optional

---

## Features

- Browse and search university courses by topic, university, or keyword
- YouTube playlist import — add any playlist as a course via the admin panel
- Per-course dynamic SEO metadata (`<title>`, `<description>`, OpenGraph, Twitter cards)
- Watch progress saved locally (no account needed)
- Personal "My List" and watch history
- Admin panel for managing courses, content whitelist, and platform settings
- Fully responsive — mobile, tablet, and desktop
- Dark-mode first design

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, SSR), Tailwind CSS, shadcn/ui |
| Backend | FastAPI (Python 3.11), Uvicorn |
| Database | MongoDB 7 |
| Containerization | Docker, Docker Compose |
| Web Server | Nginx |
| SSL | Let's Encrypt (Certbot) |

---

## Running Locally (No Docker Required)

Docker is **completely optional**. The simplest way to run EduStream is directly on your machine.

### Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB (local or [Atlas free tier](https://www.mongodb.com/atlas))
- YouTube Data API v3 key ([get one here](https://console.cloud.google.com))

### 1. Clone

```bash
git clone https://github.com/yadavplusshubham/EdustreamCo.git
cd EdustreamCo
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # fill in your values
pip install -r requirements.txt
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Frontend

```bash
cd frontend-next
cp .env.example .env.local   # set NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it — no containers needed.

---

## Docker Deployment (Optional)

Use Docker if you want an isolated, reproducible production environment.

### 1. Clone and configure

```bash
git clone https://github.com/yadavplusshubham/EdustreamCo.git
cd EdustreamCo
cp backend/.env.example backend/.env   # fill in values
```

### 2. Start all services

```bash
docker compose up -d
```

This starts:
- `edustream-frontend` → port `3010`
- `edustream-backend` (via `edustream-api-proxy`) → port `8011`
- `edustream-mongo` (internal only)

### 3. Reverse proxy

Point your Nginx/Caddy/Traefik at:
- `localhost:3010` → your domain (frontend)
- `localhost:8011` → your domain `/api/` (backend)

See [`nginx/edustream-site.conf`](nginx/edustream-site.conf) for a ready-made Nginx config with SSL.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name (default: `edustream`) |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `ADMIN_USERNAME` | Admin panel username |
| `ADMIN_PASSWORD` | Admin panel password |

### Frontend (`frontend-next/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Backend base URL (e.g. `http://localhost:8001`) |

---

## Project Structure

```
EdustreamCo/
├── backend/                  # FastAPI backend
│   ├── server.py             # Main application
│   ├── requirements.txt
│   └── Dockerfile
├── frontend-next/            # Next.js 15 frontend (SSR)
│   ├── app/                  # App Router pages
│   │   ├── page.jsx          # Home page
│   │   ├── watch/[courseId]/ # Course player + SSR metadata
│   │   ├── edusigninup/      # Admin panel
│   │   ├── my-courses/       # Watch history
│   │   └── profile/          # Admin profile
│   ├── components/           # UI components (shadcn/ui + custom)
│   ├── context/              # Auth context
│   └── Dockerfile
├── nginx/                    # Nginx config snippets
└── docker-compose.yml        # Optional: containerized deployment
```

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

1. Fork the repo
2. Create your branch: `git checkout -b feat/your-feature`
3. Commit with [conventional commits](https://www.conventionalcommits.org): `git commit -m 'feat: add your feature'`
4. Push and open a Pull Request

---

## Security

Please **do not** open public issues for security vulnerabilities. See [SECURITY.md](SECURITY.md) for responsible disclosure.

---

## License

[MIT](LICENSE) © EduStream Contributors
