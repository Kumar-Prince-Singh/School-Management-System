import time
import os
import psutil
from datetime import datetime, timezone
from fastapi import APIRouter, Response, status
from app.database import check_db_connection
from app.config import settings

router = APIRouter(tags=["Health & Monitoring"])

START_TIME = time.time()


@router.get("/health")
def health_check():
    """Liveness probe: verifies that the FastAPI application is alive and responding."""
    uptime_seconds = int(time.time() - START_TIME)
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "uptime_seconds": uptime_seconds,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/ready")
def readiness_check(response: Response):
    """Readiness probe: verifies that the database and internal dependencies are ready."""
    db_ok = check_db_connection()
    uptime_seconds = int(time.time() - START_TIME)

    process_info = {
        "pid": os.getpid(),
    }
    try:
        proc = psutil.Process()
        process_info["memory_mb"] = round(proc.memory_info().rss / (1024 * 1024), 2)
        process_info["cpu_percent"] = proc.cpu_percent(interval=None)
    except Exception:
        pass

    if not db_ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "unready",
            "database": {
                "status": "disconnected",
                "healthy": False,
            },
            "uptime_seconds": uptime_seconds,
            "process": process_info,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    return {
        "status": "ready",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": {
            "status": "connected",
            "healthy": True,
        },
        "uptime_seconds": uptime_seconds,
        "process": process_info,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

