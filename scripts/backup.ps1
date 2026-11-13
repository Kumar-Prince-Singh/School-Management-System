# ==============================================================================
# Database Backup Script (PowerShell)
# Project: Cloud Deployment & CI/CD – School Management Platform
# Candidate: Prince Kumar (Reg: 12314718)
# Company: ALGIONS AI LABS PRIVATE LIMITED
# ==============================================================================

$BackupDir = Join-Path (Get-Location) "backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFileName = "school_db_backup_$Timestamp.sql"
$BackupFilePath = Join-Path $BackupDir $BackupFileName
$ContainerName = "school_postgres"
$DbUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "postgres" }
$DbName = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "school_db" }

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Starting PostgreSQL Database Backup" -ForegroundColor Cyan
Write-Host " Target DB: $DbName | Time: $Timestamp" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$running = docker ps --format '{{.Names}}' | Select-String -Pattern "^$ContainerName`$"
if (-not $running) {
    Write-Host "[ERROR] PostgreSQL container '$ContainerName' is not running." -ForegroundColor Red
    Write-Host "Start services first: docker compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "[INFO] Executing pg_dump inside container '$ContainerName'..." -ForegroundColor Gray
docker exec -t $ContainerName pg_dump -U $DbUser -d $DbName --clean --if-exists > $BackupFilePath

if (Test-Path $BackupFilePath) {
    $fileSize = (Get-Item $BackupFilePath).Length / 1KB
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] Database Backup Created Successfully!" -ForegroundColor Green
    Write-Host " File: $BackupFilePath" -ForegroundColor Green
    Write-Host " Size: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Backup failed to generate file." -ForegroundColor Red
    exit 1
}
