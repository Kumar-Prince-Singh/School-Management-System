import time
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine, init_db
from app.routes import (
    auth_router,
    students_router,
    classes_router,
    attendance_router,
    dashboard_router,
    health_router,
)

# Configure structured logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("school_platform")

# Initialize tables idempotently
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Production-grade School Management Platform API built for ALGIONS AI LABS assessment. "
        "Candidate: Prince Kumar (Reg: 12314718)."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS configuration
cors_kwargs = {
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}

if "*" in settings.CORS_ORIGINS:
    cors_kwargs["allow_origins"] = ["*"]
    cors_kwargs["allow_credentials"] = False
else:
    cors_kwargs["allow_origins"] = settings.CORS_ORIGINS
    cors_kwargs["allow_credentials"] = True
    if settings.CORS_ORIGIN_REGEX:
        cors_kwargs["allow_origin_regex"] = settings.CORS_ORIGIN_REGEX

app.add_middleware(CORSMiddleware, **cors_kwargs)


# Structured Request/Response Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"
    method = request.method
    path = request.url.path

    try:
        response = await call_next(request)
        process_time = round((time.time() - start_time) * 1000, 2)
        logger.info(f"{method} {path} - status={response.status_code} ip={client_ip} duration={process_time}ms")
        response.headers["X-Process-Time"] = f"{process_time}ms"
        return response
    except Exception as exc:
        process_time = round((time.time() - start_time) * 1000, 2)
        logger.error(f"{method} {path} - ERROR={str(exc)} ip={client_ip} duration={process_time}ms", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error occurred. Please check server logs."}
        )


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred."}
    )


# Health checks mounted at root
app.include_router(health_router)

# API routes mounted under /api
api_prefix = settings.API_PREFIX
app.include_router(auth_router, prefix=api_prefix)
app.include_router(students_router, prefix=api_prefix)
app.include_router(classes_router, prefix=api_prefix)
app.include_router(attendance_router, prefix=api_prefix)
app.include_router(dashboard_router, prefix=api_prefix)
app.include_router(health_router, prefix=api_prefix)  # Also available under /api/health and /api/ready


@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "candidate": settings.CANDIDATE_NAME,
        "registration_number": settings.REGISTRATION_NUMBER,
        "company": settings.COMPANY,
        "status": "operational",
        "documentation": "/docs",
        "health": "/health",
        "readiness": "/ready",
    }
