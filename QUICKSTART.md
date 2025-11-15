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

Go to: **http://localhost**

### 6. Login

- Email: `admin@example.com`
- Password: `admin123`

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
