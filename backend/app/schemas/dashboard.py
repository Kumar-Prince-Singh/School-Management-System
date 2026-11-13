from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class DashboardStats(BaseModel):
    total_students: int
    total_classes: int
    attendance_today: int
    attendance_percentage: float
    active_teachers: int
    system_status: str


class AttendanceChartPoint(BaseModel):
    date: str
    present: int
    absent: int
    late: int
    attendance_rate: float


class ClassDistributionPoint(BaseModel):
    class_id: int
    class_name: str
    student_count: int


class RecentActivityItem(BaseModel):
    id: int
    action: str
    username: str
    details: Optional[str] = None
    timestamp: datetime
    entity_type: str


class RecentAttendanceRecord(BaseModel):
    id: int
    student_name: str
    student_code: str
    class_name: str
    status: str
    date: str
    session: str
    recorded_by: Optional[str] = None
