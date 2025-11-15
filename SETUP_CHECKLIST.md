# Setup Checklist

Use this checklist to verify your setup is working correctly.

## Pre-Flight Checks

- [ ] Docker Desktop is installed and running
- [ ] Docker and Docker Compose commands work (`docker --version`, `docker-compose --version`)
- [ ] Project folder is accessible
- [ ] No other services using ports 80, 4000, 3306, or 8080

## Setup Steps

- [ ] Run `docker-compose up -d --build`
- [ ] Wait for all containers to start (check with `docker-compose ps`)
- [ ] Database shows `(healthy)` status
- [ ] Backend logs show "Database initialized and seeded"
- [ ] Backend logs show "Server running on http://localhost:4000"

## Verification Tests

- [ ] Can access http://localhost (frontend loads)
- [ ] Can access http://localhost:4000/health (returns JSON)
- [ ] Can access http://localhost:8080 (Adminer loads)
- [ ] Can login at http://localhost with admin credentials
- [ ] Can see staff list after login

## Troubleshooting

If any step fails:

1. Check logs: `docker-compose logs -f`
2. Check status: `docker-compose ps`
3. Try restart: `docker-compose restart`
4. Try fresh start: `docker-compose down -v && docker-compose up -d --build`

## Success Indicators

- All containers show "Up" status
- No error messages in logs
- Can login successfully
- Can navigate the application
