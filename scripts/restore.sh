#!/usr/bin/env bash
# ==============================================================================
# Database Restore Script - PostgreSQL Restore Verification
# Project: Cloud Deployment & CI/CD – School Management Platform
# Candidate: Prince Kumar (Reg: 12314718)
# Company: ALGIONS AI LABS PRIVATE LIMITED
# ==============================================================================

set -euo pipefail

BACKUP_DIR="$(pwd)/backups"
CONTAINER_NAME="school_postgres"
DB_NAME="${POSTGRES_DB:-school_db}"
DB_USER="${POSTGRES_USER:-postgres}"

echo "======================================================================"
echo " Database Restore Utility"
echo " Target DB: ${DB_NAME}"
echo "======================================================================"

# 1. Verify container is running
if ! docker ps --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}\$"; then
    echo "[ERROR] Database container '${CONTAINER_NAME}' is not running." >&2
    echo "Please start the services first: docker compose up -d" >&2
    exit 1
fi

# 2. Select backup file
if [ "$#" -ge 1 ]; then
    RESTORE_FILE="$1"
else
    # Find the latest backup automatically
    LATEST_BACKUP=$(ls -t "${BACKUP_DIR}"/school_db_backup_*.sql.gz 2>/dev/null | head -n 1 || true)
    if [ -z "${LATEST_BACKUP}" ]; then
        echo "[ERROR] No backup files found in '${BACKUP_DIR}'." >&2
        echo "Usage: ./scripts/restore.sh [path/to/backup.sql.gz]" >&2
        exit 1
    fi
    RESTORE_FILE="${LATEST_BACKUP}"
fi

if [ ! -f "${RESTORE_FILE}" ]; then
    echo "[ERROR] Backup file '${RESTORE_FILE}' does not exist." >&2
    exit 1
fi

echo "[INFO] Selected backup file: ${RESTORE_FILE}"
echo ""
echo " [WARNING] Restoring this backup will OVERWRITE existing data in '${DB_NAME}'!"
read -r -p "Are you sure you want to proceed with restore? [y/N]: " CONFIRMATION

if [[ ! "${CONFIRMATION}" =~ ^[Yy]$ ]]; then
    echo "[INFO] Restore aborted by user."
    exit 0
fi

echo "[INFO] Decompressing and executing database restore..."

# 3. Stream decompressed SQL dump to container psql
if gunzip -c "${RESTORE_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" > /dev/null; then
    echo "======================================================================"
    echo " [SUCCESS] Database Restored Successfully from:"
    echo " ${RESTORE_FILE}"
    echo " Verifying connectivity..."
    docker exec -t "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT COUNT(*) AS total_students FROM students;"
    echo "======================================================================"
    exit 0
else
    echo "[ERROR] Database restoration encountered an error!" >&2
    exit 1
fi

