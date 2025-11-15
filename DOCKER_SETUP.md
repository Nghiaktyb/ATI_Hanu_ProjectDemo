# Docker Setup Guide

This project is fully configured to run with Docker using the database password: `Nghia27112004@`

## Quick Start

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove all data (clean slate)
docker-compose down -v
```

## Services

1. **Database (MySQL)**: Port 3306

   - Username: `root`
   - Password: `Nghia27112004@`
   - Database: `staff_platform`

2. **Backend API**: Port 4000

   - Automatically connects to database
   - Creates tables and seeds initial data on startup

3. **Frontend**: Port 80

   - Served via Nginx
   - Connects to backend at http://localhost:4000

4. **Adminer**: Port 8080
   - Database administration tool
   - Access at http://localhost:8080

## Environment Variables

The docker-compose.yml file is pre-configured with:

- Database password: `Nghia27112004@`
- Database name: `staff_platform`
- Backend port: `4000`
- Frontend port: `80`

Optional environment variables (can be set in .env file or docker-compose.yml):

- `JWT_SECRET`: JWT secret key (default: dev_secret_change_me_in_production)
- `GEMINI_API_KEY`: For AI features (optional)
- `GEMINI_MODEL`: Gemini model to use (default: gemini-2.5-pro)

## Troubleshooting

### Database connection issues

- Ensure MySQL container is healthy: `docker-compose ps`
- Check database logs: `docker-compose logs db`

### Backend not starting

- Check backend logs: `docker-compose logs backend`
- Ensure database is ready before backend starts (healthcheck configured)

### Frontend not loading

- Check frontend logs: `docker-compose logs frontend`
- Verify backend is running: `curl http://localhost:4000/health`

### Rebuild after code changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Rebuild all services
docker-compose build
docker-compose up -d
```

## Development Mode

For development, you can run services individually:

```bash
# Start only database
docker-compose up -d db

# Run backend locally
cd backend
npm install
npm run dev

# Run frontend locally
cd frontend
npm install
npm run dev
```
