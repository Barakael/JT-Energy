# HR System

Monorepo combining the HR React frontend and Laravel backend.

```
HR-System/
├── frontend/        # React + Vite + TypeScript + Tailwind (shadcn/ui)
├── backend/         # Laravel 12 + Sanctum + Spatie Permissions
└── package.json     # Root scripts to run both together
```

## Quick Start

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure backend environment
```bash
cp backend/.env.example backend/.env
cd backend && php artisan key:generate
```
Edit `backend/.env` with your database credentials, then:
```bash
npm run migrate
```

### 3. Run both simultaneously
```bash
npm install          # installs concurrently at the root
npm run dev          # starts frontend (Vite) + backend (Laravel) together
```

| Service  | URL                     |
|----------|-------------------------|
| Frontend | http://localhost:5173   |
| Backend  | http://localhost:8000   |

## Individual Commands

| Command                    | Description                        |
|----------------------------|------------------------------------|
| `npm run frontend`         | Start Vite dev server              |
| `npm run backend`          | Start Laravel dev server           |
| `npm run build:frontend`   | Production build for frontend      |
| `npm run migrate`          | Run Laravel migrations             |
| `npm run migrate:fresh`    | Fresh migration with seeders       |
| `npm run test:frontend`    | Run Vitest tests                   |
| `npm run test:backend`     | Run PHPUnit tests                  |
