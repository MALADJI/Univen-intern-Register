# Quick Diagnostic Script for Location Assignment Endpoint
# Run this to check if everything is set up correctly

Write-Host "=== Location Assignment Endpoint Diagnostic ===" -ForegroundColor Cyan
Write-Host ""

# Check if Spring Boot is running
Write-Host "1. Checking if Spring Boot is running on port 8082..." -ForegroundColor Yellow
$port8082 = netstat -ano | findstr :8082
if ($port8082) {
    Write-Host "   ✓ Spring Boot appears to be running on port 8082" -ForegroundColor Green
} else {
    Write-Host "   ✗ Spring Boot is NOT running on port 8082" -ForegroundColor Red
    Write-Host "   → Start the application with: mvn spring-boot:run" -ForegroundColor Yellow
}
Write-Host ""

# Check if migration file exists
Write-Host "2. Checking for migration file..." -ForegroundColor Yellow
if (Test-Path "ADD_LOCATION_TO_INTERN_MIGRATION.sql") {
    Write-Host "   ✓ Migration file exists: ADD_LOCATION_TO_INTERN_MIGRATION.sql" -ForegroundColor Green
    Write-Host "   → Make sure you've run this migration in your database!" -ForegroundColor Yellow
} else {
    Write-Host "   ✗ Migration file not found" -ForegroundColor Red
}
Write-Host ""

# Check if endpoint code exists
Write-Host "3. Checking if endpoint code exists..." -ForegroundColor Yellow
$controllerPath = "src\main\java\com\internregister\controller\InternController.java"
if (Test-Path $controllerPath) {
    $controllerContent = Get-Content $controllerPath -Raw
    if ($controllerContent -match "assignLocationToIntern") {
        Write-Host "   ✓ Endpoint code found in InternController.java" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Endpoint code NOT found in InternController.java" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ InternController.java not found" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run the database migration (if not done):" -ForegroundColor White
Write-Host "   mysql -u username -p database_name < ADD_LOCATION_TO_INTERN_MIGRATION.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Restart Spring Boot application:" -ForegroundColor White
Write-Host "   mvn spring-boot:run" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test the endpoint:" -ForegroundColor White
Write-Host "   PUT http://localhost:8082/api/interns/{internId}/location" -ForegroundColor Gray
Write-Host "   Body: { `"locationId`": 1 }" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Check browser Network tab to see the exact URL being called" -ForegroundColor White
Write-Host ""

