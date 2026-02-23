# ============================================
# SET EMAIL ENVIRONMENT VARIABLES
# ============================================
# Simple script to set email environment variables
#
# Usage:
#   .\SET_EMAIL_VARS.ps1
#
# ============================================

# Set Email Username
$env:MAIL_USERNAME = "Kulani.baloyi@univen.ac.za"

# Set Email Password
$env:MAIL_PASSWORD = "Kuli@982807@ac@za"

# Display confirmation
Write-Host "===========================================" -ForegroundColor Green
Write-Host "✓ Environment Variables Set Successfully" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host "MAIL_USERNAME: $env:MAIL_USERNAME" -ForegroundColor Cyan
Write-Host "MAIL_PASSWORD: [CONFIGURED]" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next step: Run 'mvn spring-boot:run' to start the application" -ForegroundColor Yellow
Write-Host ""

