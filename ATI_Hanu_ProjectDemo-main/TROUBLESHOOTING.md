# Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Port already in use"

**Error Message:**

```
Error: bind: address already in use
```

**Solution:**

1. Find what's using the port:

   ```bash
   # Windows PowerShell
   netstat -ano | findstr :4000
   netstat -ano | findstr :5173
   netstat -ano | findstr :3307
   ```

2. Stop the conflicting service or change ports in `docker-compose.yml`:

   ```yaml
   ports:
     - "4001:4000" # Changed from 4000
     - "8081:5173" # Changed from 5173 (frontend Vite dev server)
   ```

3. Restart: `docker-compose up -d`

---

### Issue 2: "Database connection refused"

**Error Message:**

```
Error: connect ECONNREFUSED
Access denied for user 'root'
```

**Solutions:**

**A. Wait for database initialization**

```bash
# Check database logs
docker-compose logs db

# Wait until you see: "ready for connections"
# Then restart backend
docker-compose restart backend
```

**B. Verify database is healthy**

```bash
docker-compose ps
# Database should show (healthy)
```

**C. Check password in docker-compose.yml**

- Ensure password is: `Nghia27112004@`
- No extra spaces or quotes

**D. Fresh database start**

```bash
docker-compose down -v
docker-compose up -d
```

---

### Issue 3: "Cannot connect to Docker daemon"

**Error Message:**

```
Cannot connect to the Docker daemon
```

**Solution:**

1. Start Docker Desktop
2. Wait for Docker to fully start (whale icon should be steady)
3. Try command again

---

### Issue 4: "Container keeps restarting"

**Check logs:**

```bash
docker-compose logs <service-name>
```

**Common causes:**

- Database not ready (wait longer)
- Port conflict (change ports)
- Configuration error (check docker-compose.yml)

**Solution:**

```bash
# Stop everything
docker-compose down

# Check configuration
# Fix any errors in docker-compose.yml

# Start again
docker-compose up -d --build
```

---

### Issue 5: "Frontend shows blank page or old code"

**Check:**

1. Backend is running: http://localhost:4000/health
2. Frontend is running: Check `docker-compose logs frontend` for "VITE v7.x.x ready"
3. Access frontend at correct URL: **http://localhost:5173** (not port 80)
4. Browser console for errors (F12)

**Solution:**

```bash
# Rebuild frontend
docker-compose up -d --build frontend

# Check if backend URL is correct
# Should be: http://localhost:4000
```

**If you see old code or features not working:**

1. **Clear browser cache:**
   - Open DevTools (F12)
   - Go to Network tab
   - **Check "Disable cache"** (keep DevTools open)
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

2. **Or clear all cache:**
   - Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Select "All time"
   - Click "Clear data"
   - Close and reopen browser

3. **Verify you're accessing the correct port:**
   - Frontend dev server: `http://localhost:5173`
   - Not `http://localhost` or `http://localhost:80`

---

### Issue 6: "Login returns 500 error"

**Check backend logs:**

```bash
docker-compose logs backend | Select-String -Pattern "error|Error"
```

**Common causes:**

- Database not connected
- Database not initialized

**Solution:**

```bash
# Wait for database
docker-compose logs db

# Restart backend
docker-compose restart backend

# Check logs again
docker-compose logs --tail=20 backend
```

---

### Issue 7: "Build fails"

**Error:**

```
npm error
ERROR [builder] RUN npm ci
```

**Solutions:**

**A. Clear Docker cache**

```bash
docker-compose build --no-cache
```

**B. Check package-lock.json exists**

```bash
# Backend
ls backend/package-lock.json

# Frontend
ls frontend/package-lock.json
```

**C. Reinstall dependencies locally first**

```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

---

### Issue 8: "Out of disk space"

**Error:**

```
no space left on device
```

**Solution:**

```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune
```

---

### Issue 9: "Services start but don't work"

**Diagnosis steps:**

1. Check all services are up: `docker-compose ps`
2. Check logs: `docker-compose logs -f`
3. Test backend: http://localhost:4000/health
4. Test frontend: http://localhost:5173 (Vite dev server)
5. Check browser console (F12)
6. **Clear browser cache** if seeing old code (see Issue 5)

**Solution:**

```bash
# Complete restart
docker-compose down
docker-compose up -d --build

# Wait 60 seconds
# Then test again
```

---

### Issue 10: "Frontend shows Payroll for managers" or "Role restrictions not working"

**Symptom:**
- Managers can see Payroll button when they shouldn't
- Role-based features not working correctly

**Cause:**
Browser is serving cached JavaScript files

**Solution:**

1. **Clear browser cache completely:**
   ```bash
   # In browser DevTools (F12):
   # 1. Go to Network tab
   # 2. Check "Disable cache"
   # 3. Keep DevTools open
   # 4. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   ```

2. **Or clear all site data:**
   - Press `Ctrl + Shift + Delete`
   - Select "All time"
   - Check "Cached images and files" and "Cookies and other site data"
   - Click "Clear data"
   - Close browser completely and reopen

3. **Verify role in console:**
   ```javascript
   // In browser console (F12):
   localStorage.getItem('role')
   // Should return: "manager" (lowercase) for manager account
   ```

4. **If still not working:**
   ```bash
   # Rebuild frontend to ensure latest code
   docker-compose stop frontend
   docker-compose up -d --build frontend
   # Then clear browser cache again
   ```

**Note:** The code correctly restricts Payroll to admins only. If managers can see it, it's a browser caching issue.

---

### Issue 11: "Permission denied" (Linux/Mac)

**Error:**

```
permission denied while trying to connect
```

**Solution:**

```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
# Log out and back in

# Or use sudo (not recommended)
sudo docker-compose up -d
```

---

## Diagnostic Commands

### Check Everything

```bash
# Status of all services
docker-compose ps

# All logs
docker-compose logs

# Resource usage
docker stats

# Network connectivity
docker network ls
docker network inspect <network-name>
```

### Test Individual Services

```bash
# Test database
docker exec -it ati-mysql mysql -uroot -p'Nghia27112004@' -e "SELECT 1;"

# Test backend API
curl http://localhost:4000/health
# Or in PowerShell:
Invoke-WebRequest http://localhost:4000/health

# Test frontend (Vite dev server on port 5173)
curl http://localhost:5173
# Or open in browser: http://localhost:5173
```

### Clean Slate

```bash
# Remove everything and start fresh
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

---

## Getting More Help

1. **Check logs first**: `docker-compose logs -f`
2. **Check service status**: `docker-compose ps`
3. **Verify Docker is running**: `docker ps`
4. **Check system resources**: Disk space, memory
5. **Review error messages**: Look for specific error codes

---

## Still Having Issues?

1. Ensure Docker Desktop is fully started
2. Try restarting Docker Desktop
3. Check firewall/antivirus isn't blocking Docker
4. Verify you have enough disk space (at least 5GB free)
5. Try the clean slate approach above
