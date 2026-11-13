from app.routes.auth import router as auth_router
from app.routes.students import router as students_router
from app.routes.classes import router as classes_router
from app.routes.attendance import router as attendance_router
from app.routes.dashboard import router as dashboard_router
from app.routes.health import router as health_router

__all__ = [
    "auth_router",
    "students_router",
    "classes_router",
    "attendance_router",
    "dashboard_router",
    "health_router",
]
