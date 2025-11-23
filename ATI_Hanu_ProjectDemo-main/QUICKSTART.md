# Quick Start Guide

## For First-Time Users

### 1. Install Docker Desktop

- Download from: https://www.docker.com/products/docker-desktop
- Install and start Docker Desktop
- Wait for Docker to be running (whale icon in system tray)

### 2. Open Terminal/Command Prompt

- Navigate to the project folder
- On Windows: Right-click folder → "Open in Terminal" or "Open PowerShell here"

### 3. Run This Command

```bash
docker-compose up -d --build
```

### 4. Wait 1-2 Minutes

The first time will take longer as it downloads images and builds the project.

### 5. Open Your Browser

Go to: **http://localhost:5173**

**Note:** The frontend runs on port 5173 (Vite dev server), not port 80.

### 6. Login

**Admin Account (Full Access):**
- Email: `admin@example.com`
- Password: `admin123`

**Manager Account (No Payroll Access):**
- Email: `manager@example.com`
- Password: `manager123`

**Staff Account:**
- Email: `linh@example.com`
- Password: `staff123`

### 7. If You See Old Code

If the page shows old features or doesn't work correctly:
1. Open DevTools (Press F12)
2. Go to Network tab
3. **Check "Disable cache"** at the top
4. Keep DevTools open
5. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) to hard refresh

## That's It!

If something goes wrong, see the full README.md for troubleshooting.

## To Stop

```bash
docker-compose down
```

## To Restart

```bash
docker-compose restart
```
