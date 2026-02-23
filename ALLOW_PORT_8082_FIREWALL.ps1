# Script to allow port 8082 through Windows Firewall
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Windows Firewall Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script requires administrator privileges!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run PowerShell as Administrator and try again:" -ForegroundColor Yellow
    Write-Host "1. Right-click PowerShell" -ForegroundColor Cyan
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor Cyan
    Write-Host "3. Navigate to this directory" -ForegroundColor Cyan
    Write-Host "4. Run: .\ALLOW_PORT_8082_FIREWALL.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or manually configure firewall:" -ForegroundColor Yellow
    Write-Host "1. Open Windows Defender Firewall" -ForegroundColor Cyan
    Write-Host "2. Advanced settings → Inbound Rules → New Rule" -ForegroundColor Cyan
    Write-Host "3. Port → TCP → 8082 → Allow connection" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "Adding firewall rule for port 8082..." -ForegroundColor Yellow

try {
    # Remove existing rule if it exists
    $existingRule = Get-NetFirewallRule -DisplayName "Spring Boot Backend Port 8082" -ErrorAction SilentlyContinue
    if ($existingRule) {
        Write-Host "Removing existing rule..." -ForegroundColor Yellow
        Remove-NetFirewallRule -DisplayName "Spring Boot Backend Port 8082"
    }

    # Add new firewall rule
    New-NetFirewallRule -DisplayName "Spring Boot Backend Port 8082" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 8082 `
        -Action Allow `
        -Profile Domain,Private,Public `
        -Description "Allows incoming connections to Spring Boot backend on port 8082"

    Write-Host ""
    Write-Host "✅ Firewall rule added successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Port 8082 is now open for incoming connections." -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Error adding firewall rule: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "You can manually add the rule:" -ForegroundColor Yellow
    Write-Host "1. Open Windows Defender Firewall" -ForegroundColor Cyan
    Write-Host "2. Advanced settings → Inbound Rules → New Rule" -ForegroundColor Cyan
    Write-Host "3. Port → TCP → 8082 → Allow connection" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

