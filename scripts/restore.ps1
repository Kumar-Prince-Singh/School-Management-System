# ==============================================================================
# Database Restore Script (PowerShell)
# Project: Cloud Deployment & CI/CD – School Management Platform
# Candidate: Prince Kumar (Reg: 12314718)
# Company: ALGIONS AI LABS PRIVATE LIMITED
# ==============================================================================

param(
    [string]$BackupPath
)

$BackupDir = Join-Path (Get-Location) "backups"
$ContainerName = "school_postgres"
$DbUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "postgres" }
$DbName = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "school_db" }

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Database Restore Utility (PowerShell)" -ForegroundColor Cyan
Write-Host " Target DB: $DbName" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$running = docker ps --format '{{.Names}}' | Select-String -Pattern "^$ContainerName`$"
if (-not $running) {
    Write-Host "[ERROR] PostgreSQL container '$ContainerName' is not running." -ForegroundColor Red
    exit 1
}

if (-not $BackupPath) {
    $latest = Get-ChildItem -Path $BackupDir -Filter "school_db_backup_*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $latest) {
        Write-Host "[ERROR] No backup files found in $BackupDir." -ForegroundColor Red
        exit 1
    }
    $BackupPath = $latest.FullName
}

Write-Host "[INFO] Restoring from: $BackupPath" -ForegroundColor Gray
$confirm = Read-Host "Proceeding will OVERWRITE active database data. Continue? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "[INFO] Restore aborted by user." -ForegroundColor Yellow
    exit 0
}

Get-Content $BackupPath | docker exec -i $ContainerName psql -U $DbUser -d $DbName

Write-Host "======================================================================" -ForegroundColor Green
Write-Host " [SUCCESS] Database Restored Successfully!" -ForegroundColor Green
Write-Host " Verifying student record count..." -ForegroundColor Green
docker exec -t $ContainerName psql -U $DbUser -d $DbName -c "SELECT COUNT(*) AS total_students FROM students;"
Write-Host "======================================================================" -ForegroundColor Green
