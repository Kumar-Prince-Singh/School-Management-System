#!/usr/bin/env bash
# ==============================================================================
# Service Rollback Script
# Project: Cloud Deployment & CI/CD – School Management Platform
# Candidate: Prince Kumar (Reg: 12314718)
# Company: ALGIONS AI LABS PRIVATE LIMITED
# ==============================================================================

set -euo pipefail

TARGET_VERSION="${1:-}"

echo "======================================================================"
echo " Service Rollback & Recovery Utility"
echo " Candidate: Prince Kumar (Reg: 12314718)"
echo " Company: ALGIONS AI LABS PRIVATE LIMITED"
echo "======================================================================"

if [ -z "${TARGET_VERSION}" ]; then
    echo "Usage: ./scripts/rollback.sh <target-git-sha-or-tag>"
    echo ""
    echo "Example: ./scripts/rollback.sh v1.0.0"
    echo "         ./scripts/rollback.sh a1b2c3d"
    echo ""
    echo "Currently available local git commits:"
    git log --oneline -n 5 || echo "(Git log unavailable)"
    exit 1
fi

echo "[INFO] Initiating rollback to target commit / tag: ${TARGET_VERSION}"

# Check working tree status
if [ -n "$(git status --porcelain)" ]; then
    echo "[WARNING] Uncommitted changes detected in working tree. Stashing before rollback..."
    git stash save "Stashed prior to rollback to ${TARGET_VERSION} - $(date)"
fi

# Checkout target version
echo "[INFO] Checking out version ${TARGET_VERSION}..."
git checkout "${TARGET_VERSION}"

# Rebuild and restart containers
echo "[INFO] Rebuilding container images for rollback version..."
docker compose down
docker compose up --build -d

echo "[INFO] Waiting for service health checks to converge (20 seconds)..."
sleep 20

# Verify health probes
echo "[INFO] Verifying backend /health endpoint..."
if curl -sf http://localhost/health > /dev/null || curl -sf http://localhost:8000/health > /dev/null; then
    echo "======================================================================"
    echo " [SUCCESS] Rollback Completed and Verified!"
    echo " Active Version: ${TARGET_VERSION}"
    echo " Status: Healthy & Ready"
    echo "======================================================================"
    exit 0
else
    echo "======================================================================"
    echo " [CRITICAL] Health check failed following rollback to ${TARGET_VERSION}!"
    echo " Check container logs: docker compose logs backend"
    echo "======================================================================"
    exit 1
fi

