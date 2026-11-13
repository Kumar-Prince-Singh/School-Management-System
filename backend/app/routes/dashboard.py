from datetime import date, timedelta
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db, check_db_connection
from app.models.student import Student
from app.models.class_model import ClassModel
from app.models.attendance import Attendance
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.dashboard import (
    DashboardStats,
    AttendanceChartPoint,
    ClassDistributionPoint,
    RecentActivityItem,
    RecentAttendanceRecord,
)
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    total_students = db.query(func.count(Student.id)).filter(Student.status == "Active").scalar() or 0
    total_classes = db.query(func.count(ClassModel.id)).scalar() or 0
    active_teachers = db.query(func.count(User.id)).filter(User.role == "teacher", User.is_active == True).scalar() or 0

    # Today's attendance
    today_records = db.query(Attendance).filter(Attendance.date == today).all()
    if today_records:
        attendance_today = len(today_records)
        present_count = sum(1 for r in today_records if r.status == "Present")
        rate = round((present_count / attendance_today * 100), 1) if attendance_today > 0 else 0.0
    else:
        # Fallback to latest available date in database if no attendance recorded today yet
        latest_date = db.query(func.max(Attendance.date)).scalar()
        if latest_date:
            latest_records = db.query(Attendance).filter(Attendance.date == latest_date).all()
            attendance_today = len(latest_records)
            present_count = sum(1 for r in latest_records if r.status == "Present")
            rate = round((present_count / attendance_today * 100), 1) if attendance_today > 0 else 0.0
        else:
            attendance_today = 0
            rate = 0.0

    db_ok = check_db_connection()
    system_status = "Healthy" if db_ok else "Degraded"

    return {
        "total_students": total_students,
        "total_classes": total_classes,
        "attendance_today": attendance_today,
        "attendance_percentage": rate,
        "active_teachers": active_teachers,
        "system_status": system_status,
    }


@router.get("/attendance-chart", response_model=List[AttendanceChartPoint])
def get_attendance_chart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Query distinct dates from attendance
    dates = db.query(Attendance.date).distinct().order_by(Attendance.date.desc()).limit(7).all()
    sorted_dates = sorted([d[0] for d in dates])

    chart_data = []
    for d in sorted_dates:
        records = db.query(Attendance).filter(Attendance.date == d).all()
        present = sum(1 for r in records if r.status == "Present")
        absent = sum(1 for r in records if r.status == "Absent")
        late = sum(1 for r in records if r.status == "Late")
        total = len(records)
        rate = round((present / total * 100), 1) if total > 0 else 0.0

        chart_data.append(
            AttendanceChartPoint(
                date=d.strftime("%Y-%m-%d"),
                present=present,
                absent=absent,
                late=late,
                attendance_rate=rate,
            )
        )

    return chart_data


@router.get("/class-distribution", response_model=List[ClassDistributionPoint])
def get_class_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    classes = db.query(ClassModel).all()
    results = []
    for c in classes:
        count = db.query(func.count(Student.id)).filter(Student.class_id == c.id).scalar() or 0
        results.append(
            ClassDistributionPoint(
                class_id=c.id,
                class_name=f"{c.name} - {c.section}",
                student_count=count,
            )
        )
    return results


@router.get("/recent-activity", response_model=List[RecentActivityItem])
def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(limit).all()
    return [
        RecentActivityItem(
            id=log.id,
            action=log.action,
            username=log.username,
            details=log.details,
            timestamp=log.timestamp,
            entity_type=log.entity_type,
        )
        for log in logs
    ]


@router.get("/recent-attendance", response_model=List[RecentAttendanceRecord])
def get_recent_attendance(
    limit: int = 8,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = db.query(Attendance).order_by(desc(Attendance.date), desc(Attendance.id)).limit(limit).all()
    results = []
    for r in records:
        results.append(
            RecentAttendanceRecord(
                id=r.id,
                student_name=r.student.full_name if r.student else "Unknown",
                student_code=r.student.student_id if r.student else "N/A",
                class_name=f"{r.class_ref.name} - {r.class_ref.section}" if r.class_ref else "N/A",
                status=r.status,
                date=r.date.strftime("%Y-%m-%d"),
                session=r.session,
                recorded_by=r.recorded_by.full_name if r.recorded_by else "System",
            )
        )
    return results
