# ============================================
# SET EMAIL ENVIRONMENT VARIABLES FOR SPRING BOOT
# ============================================
# Run this script in PowerShell BEFORE starting the application
# 
# Usage:
#   1. Open PowerShell in the project directory
#   2. Run: .\SET_ENVIRONMENT_VARIABLES.ps1
#   3. Then start the application: mvn spring-boot:run
#
# ============================================

# Email Username (Univen Office 365)
$env:MAIL_USERNAME = "Kulani.baloyi@univen.ac.za"

# Email Password
# IMPORTANT: If your password contains special characters like @, wrap it in quotes
# Example: $env:MAIL_PASSWORD = "Kuli@982807@ac@za"
$env:MAIL_PASSWORD = "Kuli@982807@ac@za"

# Display confirmation
Write-Host "===========================================" -ForegroundColor Green
Write-Host "✓ Environment Variables Set Successfully" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host "MAIL_USERNAME: $env:MAIL_USERNAME" -ForegroundColor Cyan
Write-Host "MAIL_PASSWORD: [HIDDEN]" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Keep this PowerShell window open" -ForegroundColor White
Write-Host "2. Run: mvn spring-boot:run" -ForegroundColor White
Write-Host "3. The application will use these credentials for SMTP" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: These variables are only set in THIS PowerShell session" -ForegroundColor Yellow
Write-Host "   If you close this window, you'll need to run this script again" -ForegroundColor Yellow
Write-Host ""

