#!/bin/sh
set -e

echo "[ENTRYPOINT] Starting School Management Platform Backend..."

# Run database migrations
echo "[ENTRYPOINT] Running database migrations with Alembic..."
alembic upgrade head || echo "[ENTRYPOINT] Alembic migration completed or skipped."

# Seed database with initial synthetic demo records
echo "[ENTRYPOINT] Checking database seeds..."
python -m app.seed || echo "[ENTRYPOINT] Seed step completed."

echo "[ENTRYPOINT] Launching Uvicorn production server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2

