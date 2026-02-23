# PowerShell script to automatically update MySQL database
# Removes extra reason columns from leave_requests table

$database = "intern_register"
$username = "root"
$password = "Ledge.98"
$mysqlHost = "localhost"
$port = "3306"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "MySQL Database Migration Script" -ForegroundColor Cyan
Write-Host "Removing extra reason columns" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Try to find mysql.exe in common locations
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.xx\bin\mysql.exe",
    "$env:ProgramFiles\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "$env:ProgramFiles\MySQL\MySQL Server 8.4\bin\mysql.exe"
)

$mysqlExe = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlExe = $path
        Write-Host "Found MySQL at: $mysqlExe" -ForegroundColor Green
        break
    }
}

# Also check if mysql is in PATH
if ($null -eq $mysqlExe) {
    $mysqlInPath = Get-Command mysql -ErrorAction SilentlyContinue
    if ($mysqlInPath) {
        $mysqlExe = $mysqlInPath.Source
        Write-Host "Found MySQL in PATH: $mysqlExe" -ForegroundColor Green
    }
}

if ($null -eq $mysqlExe) {
    Write-Host "ERROR: MySQL command-line client not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install MySQL or add it to your PATH." -ForegroundColor Yellow
    Write-Host "Alternatively, you can run the SQL script manually in MySQL Workbench:" -ForegroundColor Yellow
    Write-Host "  File: REMOVE_EXTRA_REASON_COLUMNS_SIMPLE.sql" -ForegroundColor Yellow
    exit 1
}

# Create temporary SQL file with corrected database name
$tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sqlContent = @"
USE intern_register;

-- Step 1: Migrate existing decline/rejection messages to reason column for rejected requests
UPDATE leave_requests 
SET reason = COALESCE(
    NULLIF(rejection_reason, ''), 
    NULLIF(rejection_message, ''), 
    NULLIF(decline_reason, ''), 
    reason
)
WHERE status = 'REJECTED' 
  AND (
    rejection_reason IS NOT NULL OR 
    rejection_message IS NOT NULL OR 
    decline_reason IS NOT NULL
  );

-- Step 2: Remove the extra columns
-- Note: MySQL 8.0+ supports IF EXISTS, older versions may need separate checks
SET @dbname = DATABASE();
SET @tablename = 'leave_requests';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = 'rejection_reason'
  ) > 0,
  'ALTER TABLE leave_requests DROP COLUMN rejection_reason;',
  'SELECT "Column rejection_reason does not exist, skipping.";'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = 'rejection_message'
  ) > 0,
  'ALTER TABLE leave_requests DROP COLUMN rejection_message;',
  'SELECT "Column rejection_message does not exist, skipping.";'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = 'decline_reason'
  ) > 0,
  'ALTER TABLE leave_requests DROP COLUMN decline_reason;',
  'SELECT "Column decline_reason does not exist, skipping.";'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

-- Step 3: Verify - should only show 'reason' column
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'intern_register' 
  AND TABLE_NAME = 'leave_requests'
  AND (COLUMN_NAME LIKE '%reason%' OR COLUMN_NAME LIKE '%message%');
"@

$sqlContent | Out-File -FilePath $tempSqlFile -Encoding UTF8

Write-Host "Connecting to MySQL database..." -ForegroundColor Yellow
Write-Host "Database: $database" -ForegroundColor Yellow
Write-Host "Host: ${mysqlHost}:${port}" -ForegroundColor Yellow
Write-Host ""

try {
    # Execute SQL script
    $result = & $mysqlExe -h $mysqlHost -P $port -u $username -p$password $database -e "source $tempSqlFile" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Database migration completed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "The following columns have been removed:" -ForegroundColor Cyan
        Write-Host "  - rejection_reason" -ForegroundColor White
        Write-Host "  - rejection_message" -ForegroundColor White
        Write-Host "  - decline_reason" -ForegroundColor White
        Write-Host ""
        Write-Host "Only the 'reason' column remains." -ForegroundColor Green
        Write-Host ""
        if ($result) {
            Write-Host "Migration output:" -ForegroundColor Cyan
            Write-Host $result
        }
    } else {
        Write-Host "ERROR: Migration failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error output:" -ForegroundColor Red
        Write-Host $result
        Write-Host ""
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "  1. MySQL server is running" -ForegroundColor Yellow
        Write-Host "  2. Database credentials are correct" -ForegroundColor Yellow
        Write-Host "  3. Database 'intern_register' exists" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "ERROR: Failed to execute migration!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    # Clean up temp file
    if (Test-Path $tempSqlFile) {
        Remove-Item $tempSqlFile -Force
    }
}

Write-Host ""
Write-Host "Migration complete!" -ForegroundColor Green

