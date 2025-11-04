@echo off
echo ========================================
echo Starting Frontend Application
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Angular CLI is installed
where ng >nul 2>&1
if %errorlevel% neq 0 (
    echo Angular CLI not found. Installing...
    npm install -g @angular/cli
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Angular CLI
        pause
        exit /b 1
    )
)

REM Try to find frontend directory
set FRONTEND_DIR=C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend

if not exist "%FRONTEND_DIR%" (
    echo.
    echo Frontend directory not found at: %FRONTEND_DIR%
    echo.
    echo Please navigate to your frontend directory manually and run: ng serve
    echo.
    pause
    exit /b 1
)

echo Changing to frontend directory: %FRONTEND_DIR%
cd /d "%FRONTEND_DIR%"

if not exist "package.json" (
    echo ERROR: package.json not found in frontend directory!
    echo Please verify the frontend directory path.
    pause
    exit /b 1
)

echo.
echo Checking if node_modules exists...
if not exist "node_modules" (
    echo node_modules not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting Angular development server...
echo.
echo ========================================
echo Frontend will be available at: http://localhost:4200
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call ng serve

pause

