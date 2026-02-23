# Set environment variables for email configuration
$env:MAIL_USERNAME = "dzulani.monyayi@univen.ac.za"
$env:MAIL_PASSWORD = "NdirendaPhindulo@545503"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Environment Variables Set:" -ForegroundColor Green
Write-Host "  MAIL_USERNAME: $env:MAIL_USERNAME" -ForegroundColor Yellow
Write-Host "  MAIL_PASSWORD: [HIDDEN]" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Spring Boot Backend..." -ForegroundColor Green
Write-Host ""

# Run the backend
.\mvnw.cmd spring-boot:run
