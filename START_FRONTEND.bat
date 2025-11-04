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

echo Node.js found: 
node --version
echo.

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

echo Angular CLI found:
ng version
echo.

REM Try possible frontend directory locations (check in order)
set FRONTEND_DIR1=C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend
set FRONTEND_DIR2=C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend
set FRONTEND_DIR3=C:\Users\kulani.baloyi\Downloads\Intern-Register-System (5)\Intern-Register-System\Intern-Register-System

set FOUND_DIR=

if exist "%FRONTEND_DIR1%\package.json" (
    set FOUND_DIR=%FRONTEND_DIR1%
    goto :found
)

if exist "%FRONTEND_DIR2%\package.json" (
    set FOUND_DIR=%FRONTEND_DIR2%
    goto :found
)

if exist "%FRONTEND_DIR3%\package.json" (
    set FOUND_DIR=%FRONTEND_DIR3%
    goto :found
)

:notfound
echo.
echo ERROR: Frontend directory not found!
echo.
echo Please navigate to your frontend directory manually and run: ng serve
echo.
echo Possible locations to check:
echo   - %FRONTEND_DIR1%
echo   - %FRONTEND_DIR2%
echo   - %FRONTEND_DIR3%
echo.
echo Or find the directory containing package.json and angular.json files.
echo.
pause
exit /b 1

:found
echo Found frontend directory: %FOUND_DIR%
echo.
cd /d "%FOUND_DIR%"

echo Checking dependencies...
if not exist "node_modules" (
    echo node_modules not found. Installing dependencies...
    echo This may take a few minutes...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
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
echo Starting Angular development server...
echo ========================================
echo.
echo Frontend will be available at: http://localhost:4200
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

call ng serve

pause

