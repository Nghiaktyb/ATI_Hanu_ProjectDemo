# Staff Platform — Backend (Express + TypeScript)

## Quickstart
```bash
cd backend
cp .env.example .env
npm i
npm run dev
```

**Seed in-memory data**
```bash
npm run db:seed
```

**API**
- `GET /health`
- `POST /auth/login` { email, password } → token (seed user: admin@example.com / admin123)
- `GET /staff`
- `POST /staff`
- `POST /shifts` / `POST /shifts/:id/assign`
- `POST /shifts/timesheets/clockin` / `POST /shifts/timesheets/clockout`
- `POST /payroll/run` { period, hourlyRate }
- `POST /ai/chat` { message }
- `POST /ai/documents/upload` multipart `file`
```