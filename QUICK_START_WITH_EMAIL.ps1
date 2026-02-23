# ============================================
# QUICK START: SET ENV VARS AND RUN APPLICATION
# ============================================
# This script sets environment variables AND starts the application
#
# Usage:
#   .\QUICK_START_WITH_EMAIL.ps1
#
# ============================================

# Set Email Environment Variables
$env:MAIL_USERNAME = "Kulani.baloyi@univen.ac.za"
$env:MAIL_PASSWORD = "Kuli@982807@ac@za"

# Display confirmation
Write-Host "===========================================" -ForegroundColor Green
Write-Host "✓ Environment Variables Set" -ForegroundColor Green
Write-Host "  MAIL_USERNAME: $env:MAIL_USERNAME" -ForegroundColor Cyan
Write-Host "  MAIL_PASSWORD: [CONFIGURED]" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Starting Spring Boot Application..." -ForegroundColor Yellow
Write-Host ""

# Start the application
mvn spring-boot:run

