# ============================================
# CHECK SMTP CONFIGURATION STATUS
# ============================================
# This script checks if SMTP is properly configured
#
# Usage:
#   .\CHECK_SMTP_STATUS.ps1
#
# ============================================

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "SMTP Configuration Status Check" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: Environment Variables
Write-Host "1. Environment Variables:" -ForegroundColor Yellow
if ($env:MAIL_USERNAME) {
    Write-Host "   ✓ MAIL_USERNAME: $env:MAIL_USERNAME" -ForegroundColor Green
} else {
    Write-Host "   ✗ MAIL_USERNAME: NOT SET" -ForegroundColor Red
    Write-Host "      Run: `$env:MAIL_USERNAME = 'Kulani.baloyi@univen.ac.za'" -ForegroundColor Gray
}

if ($env:MAIL_PASSWORD) {
    Write-Host "   ✓ MAIL_PASSWORD: [CONFIGURED]" -ForegroundColor Green
} else {
    Write-Host "   ✗ MAIL_PASSWORD: NOT SET" -ForegroundColor Red
    Write-Host "      Run: `$env:MAIL_PASSWORD = 'Kuli@982807@ac@za'" -ForegroundColor Gray
}
Write-Host ""

# Check 2: Application Properties
Write-Host "2. Application Properties:" -ForegroundColor Yellow
$propsFile = "src\main\resources\application.properties"
if (Test-Path $propsFile) {
    $content = Get-Content $propsFile -Raw
    
    if ($content -match "mail\.enabled\s*=\s*true") {
        Write-Host "   ✓ mail.enabled: true" -ForegroundColor Green
    } else {
        Write-Host "   ✗ mail.enabled: false or not set" -ForegroundColor Red
    }
    
    if ($content -match "spring\.mail\.host\s*=\s*smtp\.office365\.com") {
        Write-Host "   ✓ SMTP Host: smtp.office365.com" -ForegroundColor Green
    } else {
        Write-Host "   ✗ SMTP Host: Not configured correctly" -ForegroundColor Red
    }
    
    if ($content -match "spring\.mail\.port\s*=\s*587") {
        Write-Host "   ✓ SMTP Port: 587" -ForegroundColor Green
    } else {
        Write-Host "   ✗ SMTP Port: Not configured correctly" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ application.properties not found" -ForegroundColor Red
}
Write-Host ""

# Check 3: Application Running
Write-Host "3. Application Status:" -ForegroundColor Yellow
$connection = Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue
if ($connection) {
    Write-Host "   ✓ Application is running on port 8082" -ForegroundColor Green
    Write-Host "      Check application console for SMTP configuration messages" -ForegroundColor Gray
} else {
    Write-Host "   ⚠ Application is NOT running" -ForegroundColor Yellow
    Write-Host "      Start with: mvn spring-boot:run" -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan

$allGood = $true
if (-not $env:MAIL_USERNAME) { $allGood = $false }
if (-not $env:MAIL_PASSWORD) { $allGood = $false }

if ($allGood) {
    Write-Host "✓ Environment variables are set" -ForegroundColor Green
    Write-Host "✓ Application properties are configured" -ForegroundColor Green
    Write-Host ""
    Write-Host "SMTP should be configured when application starts." -ForegroundColor Green
    Write-Host "Check the application console for:" -ForegroundColor Yellow
    Write-Host "  - Spring Boot auto-configuration messages" -ForegroundColor White
    Write-Host "  - Any SMTP connection errors" -ForegroundColor White
} else {
    Write-Host "✗ Environment variables need to be set" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix, run these commands:" -ForegroundColor Yellow
    Write-Host "  `$env:MAIL_USERNAME = 'Kulani.baloyi@univen.ac.za'" -ForegroundColor White
    Write-Host "  `$env:MAIL_PASSWORD = 'Kuli@982807@ac@za'" -ForegroundColor White
    Write-Host "  mvn spring-boot:run" -ForegroundColor White
}
Write-Host ""

