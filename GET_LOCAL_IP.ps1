# Script to get local IP address for network access
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Network Access Information" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get local IP addresses
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object IPAddress, InterfaceAlias

Write-Host "Local IP Addresses:" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow

if ($ipAddresses) {
    foreach ($ip in $ipAddresses) {
        Write-Host "  IP: $($ip.IPAddress) - Interface: $($ip.InterfaceAlias)" -ForegroundColor Green
        Write-Host "  Backend URL: http://$($ip.IPAddress):8082" -ForegroundColor Cyan
        Write-Host ""
    }
} else {
    Write-Host "  No network interfaces found" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Access URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Localhost (same machine):" -ForegroundColor Yellow
Write-Host "  http://localhost:8082" -ForegroundColor Green
Write-Host ""
Write-Host "Network Access (from other devices):" -ForegroundColor Yellow
Write-Host "  Use one of the IP addresses above" -ForegroundColor Green
Write-Host ""
Write-Host "Example:" -ForegroundColor Yellow
Write-Host "  http://192.168.1.100:8082" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Make sure Windows Firewall allows port 8082" -ForegroundColor Yellow
Write-Host ""

