# Deployment Guide

## Production Deployment

### Prerequisites

- Docker and Docker Compose installed on server
- At least 2GB RAM available
- At least 10GB disk space
- Ports 5173 (dev frontend), 4000 (backend), 3307 (MySQL), 8080 (Adminer) available
- For production: Configure Nginx on port 80/443 instead of Vite dev server

### Step 1: Transfer Project to Server

```bash
# Option A: Using Git
git clone <repository-url>
cd ATI_Hanu_ProjectDemo-main

# Option B: Using SCP/SFTP
# Upload project folder to server
```

### Step 2: Configure Environment

Create `.env` file in project root for custom configuration:

```env
# Database
DB_PASS=your_secure_password_here

# JWT Secret (IMPORTANT: Change in production!)
JWT_SECRET=your_very_secure_jwt_secret_here

# Optional: Gemini API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Update `backend/.env` with your database credentials:

```env
PORT=4000
JWT_SECRET=your_very_secure_jwt_secret_here
DB_HOST=db
DB_PORT=3306
DB_NAME=staff_platform
DB_USER=root
DB_PASS=your_secure_password_here
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

### Step 3: Start Services

```bash
docker-compose up -d --build
```

Wait for services to initialize (1-2 minutes on first run).

### Step 4: Verify Deployment

```bash
# Check all services are running
docker-compose ps

# Check backend logs
docker-compose logs backend

# Check frontend logs
docker-compose logs frontend

# Test backend health
curl http://localhost:4000/health

# Test frontend (development)
curl http://localhost:5173
```

### Step 5: Access Application

- **Frontend (Development)**: http://your-server-ip:5173
- **Backend API**: http://your-server-ip:4000
- **Adminer (Database UI)**: http://your-server-ip:8080

### Production Frontend Setup

For production, you should:

1. Build the frontend:

   ```bash
   cd frontend
   npm run build
   ```

2. Update `docker-compose.yml` to use production frontend:

   ```yaml
   frontend:
     build:
       context: ./frontend
       dockerfile: Dockerfile # Use production Dockerfile
     ports:
       - "80:80" # Nginx serves on port 80
   ```

3. Restart services:
   ```bash
   docker-compose up -d --build frontend
   ```

## Environment-Specific Configuration

### Development

- Frontend: Vite dev server on port 5173
- Hot module replacement enabled
- Source maps available
- Detailed error messages

### Production

- Frontend: Nginx serving static files on port 80
- Optimized builds
- Minified JavaScript/CSS
- Production dependencies only

## Database Backup

### Backup Database

```bash
# Create backup
docker exec ati-mysql mysqldump -uroot -p'your_password' staff_platform > backup.sql

# Or using docker-compose
docker-compose exec db mysqldump -uroot -p'your_password' staff_platform > backup.sql
```

### Restore Database

```bash
# Restore from backup
docker exec -i ati-mysql mysql -uroot -p'your_password' staff_platform < backup.sql
```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Check Resource Usage

```bash
docker stats
```

### Health Checks

```bash
# Backend health
curl http://localhost:4000/health

# Database connection
docker-compose exec db mysqladmin ping -h localhost -uroot -p'your_password'
```

## Security Considerations

1. **Change Default Passwords**: Update `MYSQL_ROOT_PASSWORD` and `JWT_SECRET` in production
2. **Use Environment Variables**: Never commit `.env` files to version control
3. **Firewall**: Restrict access to ports 4000, 3307, 8080 (only expose 80/443 publicly)
4. **SSL/TLS**: Configure HTTPS for production (use reverse proxy like Nginx with Let's Encrypt)
5. **Database Access**: Restrict database access to backend container only
6. **API Keys**: Store Gemini API key securely in environment variables

## Scaling

### Horizontal Scaling

For high-traffic scenarios:

1. **Load Balancer**: Place Nginx or HAProxy in front of multiple backend instances
2. **Database Replication**: Set up MySQL master-slave replication
3. **File Storage**: Use shared storage (NFS, S3) for uploaded files

### Vertical Scaling

Increase container resources in `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G
```

## Troubleshooting

See `TROUBLESHOOTING.md` for common issues and solutions.

## Rollback

If deployment fails:

```bash
# Stop services
docker-compose down

# Restore from backup
# (see Database Backup section)

# Restart with previous configuration
docker-compose up -d
```

## Updates

To update the application:

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Check logs for errors
docker-compose logs -f
```
