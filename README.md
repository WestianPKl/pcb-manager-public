# PCB Manager

A full-stack web application for managing PCB components, projects, bills of materials, and production orders. Built for electronics and manufacturing teams that need inventory tracking, audit trails, and production workflow management.

## Features

- **Inventory management** — electronic components with stock tracking, low-threshold alerts, and supplier info
- **PCB projects** — multi-revision projects with image uploads (top/bottom views)
- **Bill of Materials (BOM)** — link components to PCB revisions with quantities
- **Production orders** — order lifecycle management with status tracking
- **Device tracking** — create devices from PCBs with QR code generation
- **Dashboard & analytics** — stock statistics and production metrics
- **Audit logging** — every change logged with user, timestamp, and before/after values
- **RBAC** — granular role-based access control with admin panel
- **Real-time updates** — Socket.io integration for live data sync

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js 22 + Fastify 5 + TypeScript |
| Frontend | React 19 + React Router 7 + Redux Toolkit |
| Database | PostgreSQL 16 + Drizzle ORM |
| Styling | Tailwind CSS 4 |
| File Storage | MinIO (S3-compatible) |
| Reverse Proxy | nginx |
| Infrastructure | Docker + Docker Compose |

## Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Local Development

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd pcb-manager-public

# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.development
```

Edit `backend/.env` with your local settings (database passwords, JWT secret, etc.).  
Set `VITE_API_URL=http://localhost:3000` in `frontend/.env.development`.

### 2. Start infrastructure

```bash
cd backend
docker compose up -d   # Starts PostgreSQL, MinIO, Adminer
```

### 3. Install dependencies and run migrations

```bash
# Backend
cd backend
pnpm install
pnpm approve-builds    # Required for native packages (sharp, bcrypt)
pnpm db:migrate

# Frontend (new terminal)
cd frontend
pnpm install
pnpm approve-builds
```

### 4. Start dev servers

```bash
# Terminal 1 — Backend (http://localhost:3000)
cd backend && pnpm dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && pnpm dev
```

API docs (Swagger UI) are available at `http://localhost:3000/docs` when `SWAGGER_ENABLED=true`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | HTTP server port | `3000` |
| `NODE_ENV` | Runtime environment | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database user | `pcb_user` |
| `DB_PASSWORD` | Database password | `secure_password` |
| `DB_NAME` | Database name | `pcb_manager` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | — |
| `JWT_ACCESS_EXPIRES` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES` | Refresh token TTL | `30d` |
| `MINIO_ENDPOINT` | MinIO URL | `http://localhost:9000` |
| `MINIO_USER` | MinIO root user | `minioadmin` |
| `MINIO_PASSWORD` | MinIO root password | `minioadmin123` |
| `MINIO_BUCKET_AVATARS` | Avatar bucket name | `avatars` |
| `MINIO_BUCKET_PCB` | PCB images bucket name | `pcb-images` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `GMAIL_USER` | Email sender (password reset) | — |
| `GMAIL_PASSWORD` | Gmail app password | — |
| `ADMIN_USERNAME` | Initial admin username (8+ chars) | `adminadmin` |
| `ADMIN_EMAIL` | Initial admin email | `admin@example.com` |
| `ADMIN_PASSWORD` | Initial admin password | — |
| `SWAGGER_ENABLED` | Enable Swagger UI | `true` |

### Frontend (`.env.development` / `.env.production`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |

## Database

```bash
pnpm db:generate   # Generate migration from schema changes
pnpm db:migrate    # Apply pending migrations
pnpm db:studio     # Open Drizzle Studio (visual DB browser)
```

Database admin UI (Adminer) is available at `http://localhost:8080` in development.

## Testing

```bash
cd backend
pnpm test           # Watch mode
pnpm test:run       # Single run
pnpm test:coverage  # Coverage report (v8)
```

Tests use Vitest and cover auth, inventory, PCB, production, devices, stock, and admin service logic.

## Production Deployment

The full stack is orchestrated with Docker Compose. See [deployment-guide.txt](deployment-guide.txt) for detailed server setup instructions.

```bash
# Build and start all services
docker compose build --no-cache
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Cleanup
docker image prune -f
```

Services started by Docker Compose:

| Service | Description | Default Port |
|---------|-------------|-------------|
| `postgres` | PostgreSQL 16 database | 5432 (internal) |
| `minio` | MinIO object storage | 9000 (internal) |
| `backend` | Fastify API server | 3000 (internal) |
| `frontend` | React app (nginx) | 80 (internal) |
| `nginx` | Reverse proxy | 80/443 |

For external access, see [cloudflare-tunnel-guide.txt](cloudflare-tunnel-guide.txt) for Cloudflare Tunnel setup.

## CI/CD

GitHub Actions workflow (`.github/workflows/deploy.yml`) runs on every push to `main`:

1. Install frontend dependencies
2. Install backend dependencies, run migrations, run tests
3. On success: deploy to self-hosted runner

## Project Structure

```
pcb-manager-public/
├── backend/              # Fastify API
│   ├── src/
│   │   ├── db/           # Drizzle schema + migrations
│   │   ├── modules/      # Feature modules (routes + services)
│   │   │   ├── auth/
│   │   │   ├── inventory/
│   │   │   ├── pcb/
│   │   │   ├── projects/
│   │   │   ├── devices/
│   │   │   ├── production/
│   │   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   └── audit/
│   │   ├── plugins/      # Fastify plugins (JWT, DB, MinIO, Swagger)
│   │   └── utils/        # Shared helpers (mailer, audit, scheduler)
│   └── package.json
├── frontend/             # React Router 7 app
│   ├── app/
│   │   ├── api/          # RTK Query API slices
│   │   ├── routes/       # Page components (file-based routing)
│   │   ├── components/   # Reusable UI components
│   │   ├── stores/       # Redux store + slices
│   │   └── types/        # TypeScript interfaces
│   └── package.json
├── nginx/
│   └── nginx.conf        # Reverse proxy configuration
├── docker-compose.yml
└── .env.example
```

## API Overview

All endpoints are under `/api/v1/` and require JWT authentication (Bearer token) except registration, login, and password reset.

| Module | Base Path |
|--------|-----------|
| Auth | `/api/v1/auth` |
| Inventory | `/api/v1/inventory` |
| PCB | `/api/v1/pcb` |
| Projects | `/api/v1/projects` |
| Devices | `/api/v1/devices` |
| Production | `/api/v1/production` |
| Dashboard | `/api/v1/dashboard` |
| Admin | `/api/v1/admin` |
| Audit | `/api/v1/audit` |

Full interactive documentation is available via Swagger UI at `/docs` (development only).

## License

[MIT](LICENSE)
