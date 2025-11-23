# Staff Management Platform

Modern staff management platform with scheduling, payroll, training, timesheets, and an optional AI assistant (Gemini).  
This README focuses on making the project easy to run on **any OS** and with **any MySQL-compatible database** (local container, LAN server, or managed cloud).

> Need a one-page view? Use `QUICKSTART.md`.  
> Hitting issues? See `TROUBLESHOOTING.md`.  
> Want validation steps? Use `SETUP_CHECKLIST.md` or `QUICK_TEST_CHECKLIST.md`.

---

## 1. Pick Your Setup Path

| Scenario                                                                | Use This                 | Why                                                                       |
| ----------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------- |
| You want the fastest start with everything containerized                | **Docker (recommended)** | Works the same on Windows/macOS/Linux, hides local dependency differences |
| You already have Node/MySQL installed or must connect to a corporate DB | **Manual setup**         | Lets you point the backend to any database and tweak code live            |

Both paths share the same configuration files so you can switch later without rewriting instructions.

---

## 2. Requirements

### Docker path

- Docker Desktop 4.x+ (includes Docker Compose v2)
- 6 GB of free RAM and ~5 GB of disk

### Manual path

- Node.js 20+
- npm 10+
- MySQL 8.0 (local or remote). MariaDB 10.6+ also works in practice.

Verify tooling:

```bash
docker --version
docker compose version   # Docker path

node --version
npm --version            # Manual path
```

---

## 3. Get the Code

```bash
git clone <repository-url>
cd ATI_Hanu_ProjectDemo-main
```

Or download the ZIP and extract it so the root folder contains `backend/`, `frontend/`, and `docker-compose.yml`.

---

## 4. Configure Environment Variables (Important!)

### 4.1 Files

- `backend/.env.example` → copy to `backend/.env`
- `frontend/.env.example` (if you need custom API URLs)
- Optional root `.env` to override Docker Compose variables (`GEMINI_API_KEY`, `JWT_SECRET`, etc.)

### 4.2 Minimal backend `.env`

```env
PORT=4000
JWT_SECRET=change_me

# Database (match whatever server you actually use)
DB_HOST=db                 # e.g., localhost, mysql.internal, 10.0.0.12
DB_PORT=3306               # change if your DB listens elsewhere
DB_NAME=staff_platform     # or any schema you provisioned
DB_USER=root               # supply the user that has create/read/write rights
DB_PASS=Nghia27112004@     # replace with *your* password (see note below)

# AI (optional)
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-2.5-flash
```

> **Keep credentials in sync:**
>
> - If you use the Docker-provided MySQL service, make sure `DB_PASS` matches `MYSQL_ROOT_PASSWORD` inside `docker-compose.yml`.
> - If you point to an existing database, update **all** DB fields above so they match the actual host/user/password/schema.
> - Never commit production secrets; rely on a local `.env` or environment variables injected by your orchestrator.

### 4.3 Running against a different database

| Your DB                                     | What to change                                                                                                                                                                      |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Another Docker/MySQL container on same host | Edit `DB_HOST` to the container name or IP (e.g., `mysql-container` or `172.18.0.5`) and ensure ports are exposed                                                                   |
| LAN / corporate MySQL                       | Set `DB_HOST` to the host/IP, `DB_PORT` to its port, `DB_USER`/`DB_PASS` to valid credentials. Comment out/remove the `db` service from `docker-compose.yml` if you do not need it. |
| Managed cloud DB (RDS, Cloud SQL, Azure)    | Same as LAN. Make sure the instance allows traffic from your machine or Docker network.                                                                                             |
| SQLite / other engines                      | Not supported out of the box. Use MySQL-compatible servers or fork the project.                                                                                                     |

> TIP: When using an external DB, disable the bundled MySQL container by removing or commenting the `db` service in `docker-compose.yml`.  
> Then set `DB_HOST` to the external host and restart the backend container/service.

---

## 5. Run with Docker (works on any OS)

| Step              | Windows PowerShell             | macOS / Linux                     |
| ----------------- | ------------------------------ | --------------------------------- |
| Run helper script | `.\start.bat`                  | `chmod +x start.sh && ./start.sh` |
| Or run manually   | `docker compose up -d --build` | same                              |

What happens:

1. Builds backend + frontend images
2. Starts MySQL (unless you removed it), backend, frontend, and Adminer
3. Seeds baseline data

Monitor progress:

```bash
docker compose logs -f backend
docker compose logs -f db        # if using bundled MySQL
```

Services are ready when:

- Backend log shows `Server running on http://0.0.0.0:4000`
- Frontend log shows `VITE v7.x.x ready` and `Local: http://localhost:5173/`
- DB log shows `ready for connections`

**Important:** The frontend runs on port **5173** (Vite dev server), not port 80. Access it at `http://localhost:5173`.

Check status:

```bash
docker compose ps
```

Stop everything:

```bash
docker compose down               # keep database volume
docker compose down -v            # wipe database volume
```

---

## 6. Run Without Docker (use your own database)

### Backend

```bash
cd backend
npm install
npm run dev      # or npm run build && npm start for production
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # visits http://localhost:5173 by default
```

For production-like builds, run `npm run build` in both projects and serve the frontend via any web server (or reuse the Dockerfiles as reference).

### Pointing to your DB

Set the backend `.env` with your database host, port, and credentials. The backend runs migrations/seeders on startup so the first boot may take ~30 seconds.

---

## 7. Access & Credentials

| Service         | URL                          | Notes                               |
| --------------- | ---------------------------- | ----------------------------------- |
| Frontend        | http://localhost:5173        | Vite dev server (development mode)  |
| Backend API     | http://localhost:4000        | REST API endpoint                   |
| Health check    | http://localhost:4000/health | Useful for uptime checks            |
| Adminer (DB UI) | http://localhost:8080        | Use only when running bundled MySQL |

### Default Login Credentials

**Admin Account:**

- Email: `admin@example.com`
- Password: `admin123`
- Access: Full access to all features including Payroll

**Manager Account:**

- Email: `manager@example.com`
- Password: `manager123`
- Access: All features except Payroll (Payroll is restricted to admins only)

**Staff Account:**

- Email: `linh@example.com` or `an@example.com`
- Password: `staff123`
- Access: Can view own payroll items, but cannot run payroll calculations

Adminer credentials (Docker default DB):

- System: MySQL
- Server: `db` (or the host/IP of your own database)
- Username: `root` (or the account you configured)
- Password: `Nghia27112004@` (replace with your password)
- Database: `staff_platform` (or whichever schema you selected)

If you override any of those values in `.env`, use the same values when logging in through Adminer or other SQL clients.

---

## 8. Customizing Ports, Hostnames, and Devices

Need to run multiple copies or deploy to another machine?

1. **Override ports**  
   Edit `docker-compose.yml` (or create `docker-compose.override.yml`):
   ```yaml
   services:
     backend:
       ports:
         - "5000:4000"
     frontend:
       ports:
         - "8081:5173" # Vite dev server port
   ```
2. **Expose to LAN devices**  
   Ensure the host firewall allows inbound connections to the mapped ports. Access from another PC with `http://<host-ip>:<mapped-port>`.
3. **Use external MySQL**  
   Update backend `.env` to use the remote DB, restart backend container/service, and skip the bundled `db` service.
4. **Environment-specific secrets**  
   Use a host `.env` file (same folder as `docker-compose.yml`) with:
   ```env
   GEMINI_API_KEY=your-prod-key
   JWT_SECRET=super-secret
   ```
   Compose automatically loads it.

---

## 9. Common commands (Docker)

```bash
docker compose up -d --build     # build + run
docker compose down              # stop
docker compose ps                # status
docker compose logs -f backend   # follow backend logs
docker compose restart backend   # restart service
docker exec -it ati-backend sh   # shell into backend container
docker exec -it ati-mysql bash   # shell into DB container
```

---

## 10. Features at a Glance

- **Staff Management**: Full CRUD with role, department, and job title assignment
- **Scheduling**: Create shifts, assign multiple staff, view by date/location
- **Timesheets**: Clock in/out, break tracking, automatic hours calculation
- **Payroll**: Period-based calculation with hourly rates (admin only)
- **Training System**:
  - Create courses with multiple materials (PDF, DOCX, XLSX, etc.)
  - Assign courses to multiple staff at once
  - Progress tracking (percentage, time spent, notes)
  - Material upload/download
  - "My Courses" view for staff
- **AI Assistant**:
  - Document upload and Q&A via Gemini API
  - Admin mode for confidential documents (separate storage)
  - Supports PDF, DOCX, XLSX, CSV, TXT, MD, and images (OCR)
- **Role-Based Access Control**:
  - **Admin**: Full access including Payroll
  - **Manager**: All features except Payroll
  - **Staff**: View own data, update training progress
- Adminer UI for database inspection
- React + Vite frontend with hot module replacement (development mode)

See `PROJECT_INFO.md`, `TEST_PLAN.md`, and `DEPLOYMENT.md` for deeper functional and release notes.

---

## 11. Troubleshooting Shortlist

| Symptom                          | Quick Fix                                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Ports already in use             | Change port mapping in `docker-compose.yml` or stop conflicting apps                                             |
| Backend can't reach DB           | Ensure DB is healthy, confirm `DB_HOST`/`DB_PORT`, restart backend                                               |
| MySQL container keeps restarting | Run `docker compose logs db` – usually wrong password or leftover volume. Reset with `docker compose down -v`.   |
| Frontend cannot reach API        | Backend not running or port mismatch. Check `VITE_API_URL` in `frontend/.env` or docker-compose build args.      |
| Frontend shows old code          | **Clear browser cache**: Open DevTools (F12) → Network tab → Check "Disable cache" → Hard refresh (Ctrl+Shift+R) |
| Frontend not starting            | Check `docker compose logs frontend` - ensure Dockerfile.dev exists and port 5173 is available                   |
| Payroll visible to managers      | Clear browser cache completely (see above). The code restricts Payroll to admins only.                           |
| AI assistant says key missing    | Set `GEMINI_API_KEY` in `backend/.env` or root `.env` and redeploy backend.                                      |

More detailed recipes live in `TROUBLESHOOTING.md`.

---

## 12. Project Layout

```
ATI_Hanu_ProjectDemo-main/
├── backend/        # Express + TypeScript API
├── frontend/       # React + Vite app
├── docker-compose.yml
├── *.md            # docs, test plans, quickstarts
└── start/stop scripts (.bat, .sh)
```

---

## 13. Testing the Setup

```bash
# API health
curl http://localhost:4000/health

# Frontend smoke test (note: port 5173, not 80)
open http://localhost:5173      # macOS
start http://localhost:5173     # Windows
xdg-open http://localhost:5173  # Linux

# Database via Adminer
open http://localhost:8080
```

**Important Browser Cache Note:**
If you see old code or features not working as expected:

1. Open DevTools (F12)
2. Go to Network tab
3. **Check "Disable cache"** (keep DevTools open)
4. Hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
5. Or clear all cache: `Ctrl + Shift + Delete` → Clear cached files

Recommended after first boot:

1. Login to the UI with default credentials at `http://localhost:5173`
2. Test role-based access:
   - Login as admin: Should see Payroll button
   - Login as manager: Should NOT see Payroll button
   - Login as staff: Should NOT see Payroll button
3. Upload a document in Docs & AI, ask a question, confirm Gemini response if key configured.
4. Run through `QUICK_TEST_CHECKLIST.md` items relevant to your environment.

---

## 14. Getting Help

1. `docker compose logs -f` or `npm run dev` logs for manual setups
2. `TROUBLESHOOTING.md`
3. Open an issue or reach out to the maintainer with:
   - OS and setup path (Docker/manual)
   - Database host (container/local/cloud)
   - Exact error/log snippet

---

## License

Educational / demonstration use only. Customize before production.

---

### TL;DR commands

```bash
git clone <repo> && cd ATI_Hanu_ProjectDemo-main
cp backend/.env.example backend/.env    # set DB + Gemini keys (optional)
docker compose up -d --build
# Wait for services to start, then:
open http://localhost:5173              # macOS
start http://localhost:5173             # Windows
xdg-open http://localhost:5173          # Linux
```

**First-time setup:**

1. Ensure Docker Desktop is running
2. Run `docker compose up -d --build`
3. Wait 1-2 minutes for initial build
4. Access frontend at `http://localhost:5173`
5. Login with `admin@example.com` / `admin123`
6. If you see old code, clear browser cache (see Troubleshooting section)

Happy deploying on any device, with any MySQL-compatible database! 🎉
