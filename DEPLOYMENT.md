# Deployment Guide

## Production Deployment

### Prerequisites
- Docker and Docker Compose installed on server
- At least 2GB RAM available
- At least 10GB disk space
- Ports 80, 4000, 3306, 8080 available (or configure different ports)

### Step 1: Transfer Project to Server

```bash
# Option A: Using Git
git clone <repository-url>
cd ATI_Hanu_ProjectDemo-main

# Option B: Using SCP/SFTP
# Upload project folder to server
```

### Step 2: Configure Environment (Optional)

Create `.env` file in project root for custom configuration:

```env
# Database
DB_PASS=your_secure_password_here

# JWT Secret (IMPORTANT: Change in production!)
JWT_SECRET=your_very_secure_jwt_secret_here

# Optional: Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

Then update `docker-compose.yml` to use environment variables:
```yaml
MYSQL_ROOT_PASSWORD: ${DB_PASS:-Nghia27112004@}
JWT_SECRET: ${JWT_SECRET:-dev_secret_change_me_in_production}
```

### Step 3: Start Services

```bash
docker-compose up -d --build
```

### Step 4: Verify Deployment

```bash
# Check services
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost:4000/health
```

### Step 5: Configure Firewall (if needed)

```bash
# Allow ports
sudo ufw allow 80/tcp
sudo ufw allow 4000/tcp
```

### Step 6: Set Up Reverse Proxy (Recommended)

Use Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security Considerations

1. **Change Default Passwords**
   - Update `MYSQL_ROOT_PASSWORD` in docker-compose.yml
   - Update `JWT_SECRET` in environment variables

2. **Use HTTPS**
   - Set up SSL certificate (Let's Encrypt)
   - Configure reverse proxy with SSL

3. **Firewall Rules**
   - Only expose necessary ports
   - Restrict database access (port 3306) to internal network only

4. **Regular Updates**
   ```bash
   docker-compose pull
   docker-compose up -d --build
   ```

## Backup & Restore

### Backup Database

```bash
# Backup
docker exec ati-mysql mysqldump -uroot -p'Nghia27112004@' staff_platform > backup.sql

# Or using docker-compose
docker-compose exec db mysqldump -uroot -p'Nghia27112004@' staff_platform > backup.sql
```

### Restore Database

```bash
# Restore
docker exec -i ati-mysql mysql -uroot -p'Nghia27112004@' staff_platform < backup.sql
```

### Backup Files

```bash
# Backup uploads and documents
tar -czf backup-files.tar.gz backend/data backend/uploads
```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Clean Up

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes (CAREFUL: removes data)
docker volume prune

# Full cleanup
docker system prune -a
```

## Scaling

For production with high traffic:

1. Use external MySQL database (RDS, Cloud SQL, etc.)
2. Add load balancer for backend
3. Use CDN for frontend static assets
4. Implement Redis for session management
5. Add monitoring (Prometheus, Grafana)

