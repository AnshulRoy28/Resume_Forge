@echo off
REM ResumeForge Docker Quick Start Script for Windows

echo.
echo 🐳 ResumeForge Docker Setup
echo ============================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first:
    echo    https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker Compose is not installed. Please install Docker Desktop first:
        echo    https://docs.docker.com/desktop/install/windows-install/
        pause
        exit /b 1
    )
)

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file...
    
    REM Generate JWT secret using PowerShell
    for /f "delims=" %%i in ('powershell -Command "[System.BitConverter]::ToString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)).Replace('-','')"') do set JWT_SECRET=%%i
    
    (
        echo # JWT Secret ^(auto-generated^)
        echo JWT_SECRET=%JWT_SECRET%
        echo.
        echo # Optional: GitHub Token for private repos
        echo GITHUB_TOKEN=
        echo.
        echo # Port ^(default: 3000^)
        echo PORT=3000
        echo.
        echo # Environment
        echo NODE_ENV=production
    ) > .env
    
    echo ✅ Created .env file with auto-generated JWT_SECRET
    echo.
) else (
    echo ✅ .env file already exists
    echo.
)

REM Ask user which mode to run
echo Select deployment mode:
echo 1^) Production ^(recommended^)
echo 2^) Development ^(with hot reload^)
echo.
set /p choice="Enter choice [1-2]: "

if "%choice%"=="2" (
    echo.
    echo 🚀 Starting in DEVELOPMENT mode...
    echo.
    docker-compose -f docker-compose.dev.yml up --build
) else (
    echo.
    echo 🚀 Starting in PRODUCTION mode...
    echo.
    docker-compose up -d --build
    
    echo.
    echo ✅ ResumeForge is starting!
    echo.
    echo 📊 Checking status...
    timeout /t 3 /nobreak >nul
    docker-compose ps
    
    echo.
    echo 📝 View logs with:
    echo    docker-compose logs -f
    echo.
    echo 🌐 Access the application at:
    echo    http://localhost:3000
    echo.
    echo 🛑 Stop the application with:
    echo    docker-compose down
    echo.
    pause
)
