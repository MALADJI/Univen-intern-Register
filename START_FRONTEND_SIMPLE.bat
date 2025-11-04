@echo off
echo ========================================
echo Starting Frontend Application
echo ========================================
echo.

REM Navigate to frontend directory
set FRONTEND_DIR=C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend

cd /d "%FRONTEND_DIR%"

if not exist "package.json" (
    echo ERROR: Frontend directory not found!
    echo Expected: %FRONTEND_DIR%
    echo.
    echo Please verify the frontend directory path and try again.
    pause
    exit /b 1
)

echo Frontend directory found: %FRONTEND_DIR%
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found.
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo node_modules not found. Installing dependencies...
    echo This may take a few minutes. Please wait...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Failed to install dependencies
        echo Please check the error messages above.
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
) else (
    echo Dependencies already installed.
    echo.
)

echo ========================================
echo Starting Frontend Server...
echo ========================================
echo.
echo Frontend will be available at: http://localhost:4200
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

REM Try to start with npm start first, then ng serve
where npm >nul 2>&1
if %errorlevel% equ 0 (
    echo Trying: npm start
    call npm start
    if %errorlevel% neq 0 (
        echo.
        echo npm start failed, trying: ng serve
        where ng >nul 2>&1
        if %errorlevel% equ 0 (
            call ng serve
        ) else (
            echo.
            echo ERROR: Neither npm start nor ng serve worked.
            echo Please check package.json for available scripts.
            echo.
            echo You can try manually:
            echo   1. npm start
            echo   2. ng serve
            echo   3. npx vite
            pause
            exit /b 1
        )
    )
) else (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

pause

