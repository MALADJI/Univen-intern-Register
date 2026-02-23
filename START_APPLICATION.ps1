# ============================================
# START SPRING BOOT APPLICATION WITH EMAIL
# ============================================
# This script:
#   1. Stops any process on port 8082
#   2. Sets email environment variables
#   3. Starts the Spring Boot application
#
# Usage:
#   .\START_APPLICATION.ps1
#
# ============================================

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Starting Intern Register Application" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Free port 8082 if needed
Write-Host "Step 1: Checking port 8082..." -ForegroundColor Yellow
$connection = Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue
if ($connection) {
    $processId = $connection.OwningProcess | Select-Object -First 1
    Write-Host "  Found process $processId using port 8082. Stopping..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "  ✓ Port 8082 is now free" -ForegroundColor Green
} else {
    Write-Host "  ✓ Port 8082 is free" -ForegroundColor Green
}
Write-Host ""

# Step 2: Set environment variables
Write-Host "Step 2: Setting email environment variables..." -ForegroundColor Yellow
$env:MAIL_USERNAME = "Kulani.baloyi@univen.ac.za"
$env:MAIL_PASSWORD = "Kuli@982807@ac@za"
Write-Host "  ✓ MAIL_USERNAME: $env:MAIL_USERNAME" -ForegroundColor Green
Write-Host "  ✓ MAIL_PASSWORD: [CONFIGURED]" -ForegroundColor Green
Write-Host ""

# Step 3: Start application
Write-Host "Step 3: Starting Spring Boot application..." -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

mvn spring-boot:run

