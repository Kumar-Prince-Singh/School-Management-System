from datetime import date
from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models.attendance import Attendance
from app.models.student import Student
from app.models.class_model import ClassModel
from app.models.user import User
from app.schemas.attendance import (
    AttendanceBulkCreate,
    AttendanceCreateSingle,
    AttendanceItem,
    AttendanceResponse,
    AttendanceReportResponse,
    AttendanceReportItem,
)
from app.auth.dependencies import get_current_user
from app.services.attendance_service import record_attendance_bulk

router = APIRouter(prefix="/attendance", tags=["Attendance"])


def build_attendance_response(att: Attendance) -> dict:
    student_name = att.student.full_name if att.student else None
    student_code = att.student.student_id if att.student else None
    class_name = f"{att.class_ref.name} - {att.class_ref.section}" if att.class_ref else None

    return {
        "id": att.id,
        "student_id": att.student_id,
        "class_id": att.class_id,
        "recorded_by_id": att.recorded_by_id,
        "date": att.date,
        "session": att.session,
        "status": att.status,
        "remarks": att.remarks,
        "created_at": att.created_at,
        "student_name": student_name,
        "student_code": student_code,
        "class_name": class_name,
    }


@router.get("", response_model=List[AttendanceResponse])
def get_attendance_records(
    class_id: Optional[int] = Query(None, description="Filter by Class ID"),
    attendance_date: Optional[date] = Query(None, alias="date", description="Filter by Date"),
    session_name: Optional[str] = Query(None, alias="session", description="Filter by Session (Morning/Afternoon)"),
    student_id: Optional[int] = Query(None, description="Filter by Student ID"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Attendance)

    if class_id:
        query = query.filter(Attendance.class_id == class_id)
    if attendance_date:
        query = query.filter(Attendance.date == attendance_date)
    if session_name:
        query = query.filter(Attendance.session == session_name)
    if student_id:
        query = query.filter(Attendance.student_id == student_id)

    records = query.order_by(desc(Attendance.date), Attendance.id).limit(limit).all()
    return [build_attendance_response(r) for r in records]


@router.post("", response_model=Union[List[AttendanceResponse], AttendanceResponse], status_code=status.HTTP_201_CREATED)
def record_attendance(
    request: Request,
    payload: Union[AttendanceBulkCreate, AttendanceCreateSingle],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client_ip = request.client.host if request.client else None

    if isinstance(payload, AttendanceCreateSingle):
        # Wrap single record into bulk format for consistent business rules validation
        records = [AttendanceItem(student_id=payload.student_id, status=payload.status, remarks=payload.remarks)]
        created = record_attendance_bulk(
            db=db,
            current_user=current_user,
            class_id=payload.class_id,
            attendance_date=payload.date,
            session_name=payload.session,
            records=records,
            client_ip=client_ip
        )
        return build_attendance_response(created[0])
    else:
        created = record_attendance_bulk(
            db=db,
            current_user=current_user,
            class_id=payload.class_id,
            attendance_date=payload.date,
            session_name=payload.session,
            records=payload.records,
            client_ip=client_ip
        )
        return [build_attendance_response(r) for r in created]


@router.get("/report", response_model=AttendanceReportResponse)
def get_attendance_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    class_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Attendance)
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    if class_id:
        query = query.filter(Attendance.class_id == class_id)

    all_records = query.all()

    # Aggregate by (date, class_id, session)
    groups = {}
    for r in all_records:
        key = (r.date, r.class_id, r.session)
        if key not in groups:
            groups[key] = {
                "date": r.date,
                "class_id": r.class_id,
                "class_name": f"{r.class_ref.name} - {r.class_ref.section}" if r.class_ref else f"Class #{r.class_id}",
                "session": r.session,
                "present_count": 0,
                "absent_count": 0,
                "late_count": 0,
            }
        if r.status == "Present":
            groups[key]["present_count"] += 1
        elif r.status == "Absent":
            groups[key]["absent_count"] += 1
        elif r.status == "Late":
            groups[key]["late_count"] += 1

    report_items = []
    total_present = 0
    total_absent = 0
    total_late = 0

    for key, data in sorted(groups.items(), key=lambda x: (x[0][0], x[0][1]), reverse=True):
        total_in_session = data["present_count"] + data["absent_count"] + data["late_count"]
        rate = round((data["present_count"] / total_in_session * 100), 1) if total_in_session > 0 else 0.0
        report_items.append(
            AttendanceReportItem(
                date=data["date"],
                class_id=data["class_id"],
                class_name=data["class_name"],
                session=data["session"],
                total_students=total_in_session,
                present_count=data["present_count"],
                absent_count=data["absent_count"],
                late_count=data["late_count"],
                attendance_rate=rate,
            )
        )
        total_present += data["present_count"]
        total_absent += data["absent_count"]
        total_late += data["late_count"]

    grand_total = total_present + total_absent + total_late
    overall_rate = round((total_present / grand_total * 100), 1) if grand_total > 0 else 0.0

    return {
        "summary": {
            "total_records": grand_total,
            "total_present": total_present,
            "total_absent": total_absent,
            "total_late": total_late,
            "overall_attendance_rate": overall_rate,
        },
        "records": report_items,
    }


@router.get("/{id}", response_model=AttendanceResponse)
def get_attendance_record(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    att = db.query(Attendance).filter(Attendance.id == id).first()
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return build_attendance_response(att)
