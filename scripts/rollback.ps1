# ==============================================================================
# Service Rollback Script (PowerShell)
# Project: Cloud Deployment & CI/CD – School Management Platform
# Candidate: Prince Kumar (Reg: 12314718)
# Company: ALGIONS AI LABS PRIVATE LIMITED
# ==============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$TargetVersion
)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Rollback Automation Utility" -ForegroundColor Cyan
Write-Host " Target Commit/Tag: $TargetVersion" -ForegroundColor Cyan
Write-Host " Candidate: Prince Kumar (Reg: 12314718)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$dirty = git status --porcelain
if ($dirty) {
    Write-Host "[INFO] Stashing uncommitted local workspace changes..." -ForegroundColor Yellow
    git stash save "Stash before rollback to $TargetVersion - $(Get-Date)"
}

Write-Host "[INFO] Checking out $TargetVersion..." -ForegroundColor Gray
git checkout $TargetVersion

Write-Host "[INFO] Rebuilding and relaunching containers..." -ForegroundColor Gray
docker compose down
docker compose up --build -d

Write-Host "[INFO] Awaiting health probe convergence (20 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 20

try {
    $res = Invoke-RestMethod -Uri "http://localhost/health" -Method Get -TimeoutSec 5
    if ($res.status -eq "healthy") {
        Write-Host "======================================================================" -ForegroundColor Green
        Write-Host " [SUCCESS] Rollback Completed and System Health Confirmed!" -ForegroundColor Green
        Write-Host " Active Version: $TargetVersion" -ForegroundColor Green
        Write-Host "======================================================================" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "[CRITICAL] Health check probe failed post rollback: $_" -ForegroundColor Red
    exit 1
}

