# Staff Management Platform

A full-stack staff management system with authentication, scheduling, timesheets, payroll, training, and AI-powered document Q&A.

> **New to Docker?** See [QUICKSTART.md](QUICKSTART.md) for the simplest setup guide.  
> **Having issues?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common problems and solutions.  
> **Want a checklist?** Use [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) to verify your setup.

## Quick Start (Docker - Recommended)

### Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** (includes Docker and Docker Compose)
  - Download: https://www.docker.com/products/docker-desktop
  - For Windows: Install Docker Desktop for Windows
  - For Mac: Install Docker Desktop for Mac
  - For Linux: Install Docker Engine and Docker Compose

**Verify Installation:**

```bash
docker --version
docker-compose --version
```

Both commands should return version numbers.

### Step-by-Step Setup

#### Step 1: Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd ATI_Hanu_ProjectDemo-main

# Or extract the project folder if downloaded as ZIP
```

#### Step 2: Navigate to Project Directory

```bash
cd ATI_Hanu_ProjectDemo-main
```

#### Step 3: Start All Services

**Option A: Using Script (Easiest)**

- **Windows**: Double-click `start.bat` or run it from terminal
- **Mac/Linux**: Run `chmod +x start.sh && ./start.sh`

**Option B: Using Command Line**

```bash
# Build and start all containers (database, backend, frontend)
docker-compose up -d --build
```

**What this does:**

- Downloads required Docker images (MySQL, Node.js, Nginx)
- Builds the backend and frontend applications
- Creates and initializes the MySQL database
- Starts all services in the background

**Expected output:**

```
[+] Building ...
[+] Running ...
✔ Container ati-mysql     Started
✔ Container ati-backend   Started
✔ Container ati-frontend  Started
✔ Container ati-adminer   Started
```

#### Step 4: Wait for Services to Initialize

Wait approximately **30-60 seconds** for all services to start. You can monitor the progress:

```bash
# View all logs
docker-compose logs -f

# Or view specific service logs
docker-compose logs -f backend
docker-compose logs -f db
```

**Look for these success messages:**

- Backend: `Database initialized and seeded`
- Backend: `Server running on http://localhost:4000`
- Database: `ready for connections`

Press `Ctrl+C` to exit log viewing.

#### Step 5: Verify Services are Running

```bash
docker-compose ps
```

All services should show `Up` status. The database should show `(healthy)`.

#### Step 6: Access the Application

Open your web browser and navigate to:

- **Frontend Application**: http://localhost
- **Backend API**: http://localhost:4000
- **Database Admin (Adminer)**: http://localhost:8080

#### Step 7: Login

Use these default credentials:

- **Email**: `admin@example.com`
- **Password**: `admin123`

---

## Access Information

### Application URLs

| Service          | URL                          | Description                   |
| ---------------- | ---------------------------- | ----------------------------- |
| Frontend         | http://localhost             | Main web application          |
| Backend API      | http://localhost:4000        | REST API endpoint             |
| API Health Check | http://localhost:4000/health | Check if backend is running   |
| Database Admin   | http://localhost:8080        | Adminer (database management) |

### Database Connection (Adminer)

When accessing Adminer at http://localhost:8080:

- **System**: MySQL
- **Server**: `db`
- **Username**: `root`
- **Password**: `Nghia27112004@`
- **Database**: `staff_platform`

### Default Login Credentials

- **Email**: `admin@example.com`
- **Password**: `admin123`

---

## Included Files

- `README.md` - This comprehensive guide
- `QUICKSTART.md` - Simple 5-step setup for beginners
- `TROUBLESHOOTING.md` - Solutions to common problems
- `SETUP_CHECKLIST.md` - Verification checklist
- `TEST_PLAN.md` - Comprehensive test plan for all features
- `TEST_EXECUTION_LOG.md` - Test execution tracking template
- `QUICK_TEST_CHECKLIST.md` - Quick testing checklist
- `start.bat` / `start.sh` - Quick start scripts
- `stop.bat` / `stop.sh` - Quick stop scripts

## Common Commands

### Start Services

```bash
# Start all services
docker-compose up -d

# Start and rebuild (after code changes)
docker-compose up -d --build
```

### Stop Services

```bash
# Stop all services (keeps data)
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

### View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# View last 50 lines
docker-compose logs --tail=50 backend
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Check Service Status

```bash
# List all containers
docker-compose ps

# Check if services are healthy
docker-compose ps
```

### Access Container Shell

```bash
# Access backend container
docker exec -it ati-backend sh

# Access database container
docker exec -it ati-mysql bash
```

---

## Troubleshooting

### Problem: Services won't start

**Solution:**

```bash
# Check if ports are already in use
netstat -an | findstr "4000"
netstat -an | findstr "80"
netstat -an | findstr "3306"

# If ports are in use, stop the conflicting service or change ports in docker-compose.yml
```

### Problem: Database connection error

**Solution:**

```bash
# Wait for database to fully initialize (can take 30-60 seconds)
docker-compose logs db

# Restart backend after database is ready
docker-compose restart backend
```

### Problem: "Port already in use" error

**Solution:**
Edit `docker-compose.yml` and change the port mappings:

```yaml
ports:
  - "4001:4000" # Change 4000 to 4001
  - "8081:80" # Change 80 to 8081
```

### Problem: Frontend shows connection error

**Solution:**

1. Check if backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify backend health: Open http://localhost:4000/health in browser

### Problem: Need to reset everything

**Solution:**

```bash
# Stop and remove everything including data
docker-compose down -v

# Rebuild and start fresh
docker-compose up -d --build
```

### Problem: Changes not reflecting

**Solution:**

```bash
# Rebuild containers after code changes
docker-compose up -d --build

# Or restart specific service
docker-compose restart backend
```

---

## Project Structure

```
ATI_Hanu_ProjectDemo-main/
├── backend/                 # Backend API (Express + TypeScript)
│   ├── src/
│   │   ├── db/             # Database models and setup
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utilities (auth, tfidf)
│   │   └── index.ts        # Main server file
│   ├── data/               # Document storage for AI
│   ├── uploads/            # File uploads
│   ├── Dockerfile          # Backend container config
│   └── package.json
├── frontend/               # Frontend (React + Vite)
│   ├── src/               # React components
│   ├── Dockerfile         # Frontend container config
│   ├── nginx.conf         # Nginx configuration
│   └── package.json
├── docker-compose.yml      # Docker orchestration
└── README.md              # This file
```

---

## Features

- **Staff Management**: Create, read, update, delete staff members
- **Scheduling**: Create shifts and assign staff to shifts
- **Timesheets**: Clock in/out tracking with break time calculation
- **Payroll**: Calculate payroll based on timesheets and hourly rates
- **Training**: Course management and staff training assignments
- **AI Assistant**: Document-based Q&A using Gemini API (optional)
- **Authentication**: JWT-based secure authentication

---

## Environment Variables

The project uses environment variables configured in `docker-compose.yml`. For local development, you can create `.env` files:

### Backend Environment Variables

```env
DB_HOST=db
DB_USER=root
DB_PASS=Nghia27112004@
DB_NAME=staff_platform
DB_PORT=3306
PORT=4000
JWT_SECRET=dev_secret_change_me_in_production
GEMINI_API_KEY=          # Optional: For AI features
GEMINI_MODEL=gemini-2.5-pro
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:4000
```

---

## Testing the Setup

### Test Backend API

```bash
# Using PowerShell
Invoke-WebRequest -Uri http://localhost:4000/health

# Using curl (if available)
curl http://localhost:4000/health
```

Expected response:

```json
{ "status": "ok", "timestamp": "2025-11-15T..." }
```

### Test Database Connection

1. Open http://localhost:8080 (Adminer)
2. Login with credentials above
3. You should see the `staff_platform` database

### Test Frontend

1. Open http://localhost
2. You should see the login page
3. Login with `admin@example.com` / `admin123`

---

## Development Mode (Without Docker)

If you prefer to run without Docker:

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the environment variables from docker-compose.yml

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file with VITE_API_URL=http://localhost:4000

# Start development server
npm run dev
```

### Database Setup

1. Install MySQL 8.0
2. Create database: `CREATE DATABASE staff_platform;`
3. Update backend `.env` with your MySQL credentials
4. Backend will auto-create tables on startup

---

## Known Issues & Solutions

### Issue: MySQL container keeps restarting

**Cause**: Password contains special characters or configuration error

**Solution**: The password `Nghia27112004@` is correctly configured. If issues persist:

```bash
docker-compose down -v
docker-compose up -d --build
```

### Issue: Backend can't connect to database

**Solution**:

1. Wait 30-60 seconds for MySQL to fully initialize
2. Check database logs: `docker-compose logs db`
3. Restart backend: `docker-compose restart backend`

### Issue: Frontend shows blank page

**Solution**:

1. Check browser console for errors
2. Verify backend is running: http://localhost:4000/health
3. Check frontend logs: `docker-compose logs frontend`

---

## API Endpoints

### Authentication

- `POST /auth/login` - Login with email and password

### Staff

- `GET /staff` - Get all staff
- `POST /staff` - Create staff member
- `GET /staff/:id` - Get staff by ID
- `PATCH /staff/:id` - Update staff
- `DELETE /staff/:id` - Delete staff

### Shifts

- `GET /shifts` - Get all shifts
- `POST /shifts` - Create shift
- `POST /shifts/:id/assign` - Assign staff to shift
- `GET /shifts/timesheets` - Get all timesheets
- `POST /shifts/timesheets/clockin` - Clock in
- `POST /shifts/timesheets/clockout` - Clock out

### Payroll

- `POST /payroll/run` - Calculate payroll
- `GET /payroll/items` - Get pay items

### Training

- `GET /training/courses` - Get all courses
- `POST /training/courses` - Create course
- `GET /training/assignments` - Get all assignments
- `POST /training/assignments` - Assign course to staff

### AI

- `POST /ai/chat` - Ask question about documents
- `POST /ai/documents/upload` - Upload document
- `GET /ai/documents` - List documents

---

## Getting Help

If you encounter issues:

1. **Check logs**: `docker-compose logs -f`
2. **Verify services**: `docker-compose ps`
3. **Restart services**: `docker-compose restart`
4. **Fresh start**: `docker-compose down -v && docker-compose up -d --build`

---

## 📄 License

This project is for educational/demonstration purposes.

---

## Quick Reference

```bash
# Start project
docker-compose up -d --build

# Stop project
docker-compose down

# View logs
docker-compose logs -f

# Restart after changes
docker-compose restart backend

# Complete reset
docker-compose down -v && docker-compose up -d --build
```

**Access URLs:**

- Frontend: http://localhost
- Backend: http://localhost:4000
- Database Admin: http://localhost:8080

**Login:**

- Email: `admin@example.com`
- Password: `admin123`
