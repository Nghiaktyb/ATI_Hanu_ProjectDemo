@echo off
echo ========================================
echo Staff Management Platform - Docker Start
echo ========================================
echo.
echo Starting all services...
echo.

docker-compose up -d --build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Services started successfully!
    echo ========================================
    echo.
    echo Waiting for services to initialize...
    timeout /t 10 /nobreak >nul
    echo.
    echo ========================================
    echo Access the application:
    echo ========================================
    echo Frontend:  http://localhost
    echo Backend:   http://localhost:4000
    echo Adminer:   http://localhost:8080
    echo.
    echo Login credentials:
    echo Email:    admin@example.com
    echo Password: admin123
    echo.
    echo To view logs: docker-compose logs -f
    echo To stop:      docker-compose down
    echo ========================================
    echo.
    pause
) else (
    echo.
    echo ========================================
    echo ERROR: Failed to start services
    echo ========================================
    echo.
    echo Please check:
    echo 1. Docker Desktop is running
    echo 2. You have enough disk space
    echo 3. Ports 80, 4000, 3306, 8080 are available
    echo.
    echo View logs: docker-compose logs
    echo.
    pause
)

