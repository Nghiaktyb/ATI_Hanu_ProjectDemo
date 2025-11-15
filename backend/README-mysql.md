MySQL Development Setup (Docker)
================================

This project includes a Docker Compose setup to run MySQL and Adminer for local development.

Quick start
-----------

1. Copy the example env into backend/.env and edit if needed:

   - `backend/.env.example` -> `backend/.env`

2. Start the database and Adminer:

```powershell
# from repo root
docker compose up -d
```

3. Verify services:

```powershell
# MySQL should listen on 3306
netstat -ano | findstr :3306
# Adminer available at http://localhost:8080
```

4. Start the backend (it will create tables on first run):

```powershell
cd backend
npm install
npm run db:seed    # optional - creates initial rows via backend seeder
npm run dev
```

Notes
-----
- The compose file reads environment variables for DB_USER / DB_PASS / DB_NAME / DB_PORT so you can override them in your shell or CI.
- The container's `docker-entrypoint-initdb.d` directory contains `init.sql` that creates the database on first run. Table creation is handled by the backend at startup.
- Adminer is included on port 8080 for easy DB inspection.
