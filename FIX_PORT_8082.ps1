# ============================================
# FIX PORT 8082 ALREADY IN USE
# ============================================
# This script finds and stops any process using port 8082
#
# Usage:
#   .\FIX_PORT_8082.ps1
#
# ============================================

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Checking port 8082..." -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan

# Find process using port 8082
$connection = Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue

if ($connection) {
    $processId = $connection.OwningProcess | Select-Object -First 1
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "Found process using port 8082:" -ForegroundColor Yellow
        Write-Host "  Process ID: $processId" -ForegroundColor White
        Write-Host "  Process Name: $($process.ProcessName)" -ForegroundColor White
        Write-Host "  Started: $($process.StartTime)" -ForegroundColor White
        Write-Host ""
        Write-Host "Stopping process..." -ForegroundColor Yellow
        
        # Stop the process
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        
        # Wait a moment
        Start-Sleep -Seconds 2
        
        # Verify it's stopped
        $stillRunning = Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue
        if ($stillRunning) {
            Write-Host "⚠ Warning: Process may still be running. Try again." -ForegroundColor Red
        } else {
            Write-Host "✓ Port 8082 is now free!" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠ Process not found (may have already stopped)" -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ Port 8082 is already free!" -ForegroundColor Green
}

Write-Host ""
Write-Host "You can now start the application:" -ForegroundColor Cyan
Write-Host "  mvn spring-boot:run" -ForegroundColor White
Write-Host ""

