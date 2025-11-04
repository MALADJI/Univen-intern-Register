@echo off
echo ========================================
echo   QUICK FIX: 401 Unauthorized Errors
echo ========================================
echo.
echo This script helps you fix 401 errors by:
echo 1. Checking if backend is running
echo 2. Providing instructions to clear browser storage
echo.
echo ========================================
echo.

echo [1/3] Checking if backend is running on port 8082...
netstat -ano | findstr :8082 >nul
if %errorlevel% equ 0 (
    echo    ✓ Backend is running on port 8082
) else (
    echo    ✗ Backend is NOT running on port 8082
    echo    → Start backend with: mvn spring-boot:run
)
echo.

echo [2/3] Next steps:
echo    → Open your browser
echo    → Press F12 to open DevTools
echo    → Go to Console tab
echo    → Copy and paste this:
echo.
echo    localStorage.clear();
echo    sessionStorage.clear();
echo    window.location.reload();
echo.
echo    → Press Enter
echo    → Login again
echo.

echo [3/3] After login, verify token is stored:
echo    → In Console, type: localStorage.getItem('token')
echo    → Should show a long token string
echo    → If null, token is not being stored (frontend issue)
echo.

echo ========================================
echo   IMPORTANT: Old tokens are invalid!
echo ========================================
echo.
echo After we fixed the JWT secret key, all old tokens
echo became invalid. You MUST clear storage and login
echo again to get a new, valid token.
echo.
echo ========================================
echo.
pause

