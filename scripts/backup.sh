#!/usr/bin/env bash
# ==============================================================================
# Database Backup Script - PostgreSQL Dump
# Project: Cloud Deployment & CI/CD – School Management Platform
# Candidate: Prince Kumar (Reg: 12314718)
# Company: ALGIONS AI LABS PRIVATE LIMITED
# ==============================================================================

set -euo pipefail

BACKUP_DIR="$(pwd)/backups"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
BACKUP_FILENAME="school_db_backup_${TIMESTAMP}.sql.gz"
BACKUP_FILEPATH="${BACKUP_DIR}/${BACKUP_FILENAME}"
CONTAINER_NAME="school_postgres"
DB_NAME="${POSTGRES_DB:-school_db}"
DB_USER="${POSTGRES_USER:-postgres}"

echo "======================================================================"
echo " Starting Database Backup Process"
echo " Timestamp: ${TIMESTAMP}"
echo " Target DB: ${DB_NAME}"
echo "======================================================================"

# 1. Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# 2. Check if the PostgreSQL container is running
if ! docker ps --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}\$"; then
    echo "[ERROR] Container '${CONTAINER_NAME}' is not running." >&2
    echo "Please ensure docker compose services are active: docker compose up -d" >&2
    exit 1
fi

echo "[INFO] Running pg_dump inside container '${CONTAINER_NAME}'..."

# 3. Execute pg_dump and compress via gzip
if docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${BACKUP_FILEPATH}"; then
    BACKUP_SIZE="$(du -h "${BACKUP_FILEPATH}" | cut -f1)"
    echo "======================================================================"
    echo " [SUCCESS] Database Backup Created Successfully!"
    echo " File: ${BACKUP_FILEPATH}"
    echo " Size: ${BACKUP_SIZE}"
    echo "======================================================================"
    exit 0
else
    echo "[ERROR] Database backup failed!" >&2
    rm -f "${BACKUP_FILEPATH}"
    exit 1
fi
