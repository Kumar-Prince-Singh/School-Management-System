from app.schemas.auth import LoginRequest, TokenResponse, UserSummary, TokenPayload
from app.schemas.user import UserBase, UserCreate, UserUpdate, UserResponse
from app.schemas.class_schema import ClassBase, ClassCreate, ClassUpdate, ClassResponse
from app.schemas.student import StudentBase, StudentCreate, StudentUpdate, StudentResponse, PaginatedStudentsResponse
from app.schemas.attendance import (
    AttendanceItem,
    AttendanceBulkCreate,
    AttendanceCreateSingle,
    AttendanceResponse,
    AttendanceReportItem,
    AttendanceReportResponse,
)
from app.schemas.dashboard import (
    DashboardStats,
    AttendanceChartPoint,
    ClassDistributionPoint,
    RecentActivityItem,
    RecentAttendanceRecord,
)

__all__ = [
    "LoginRequest",
    "TokenResponse",
    "UserSummary",
    "TokenPayload",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "ClassBase",
    "ClassCreate",
    "ClassUpdate",
    "ClassResponse",
    "StudentBase",
    "StudentCreate",
    "StudentUpdate",
    "StudentResponse",
    "PaginatedStudentsResponse",
    "AttendanceItem",
    "AttendanceBulkCreate",
    "AttendanceCreateSingle",
    "AttendanceResponse",
    "AttendanceReportItem",
    "AttendanceReportResponse",
    "DashboardStats",
    "AttendanceChartPoint",
    "ClassDistributionPoint",
    "RecentActivityItem",
    "RecentAttendanceRecord",
]

