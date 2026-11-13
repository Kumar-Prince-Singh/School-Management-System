from datetime import date
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models.attendance import Attendance
from app.models.class_model import ClassModel
from app.models.student import Student
from app.models.user import User
from app.schemas.attendance import AttendanceItem
from app.services.audit_service import log_audit


def verify_teacher_class_authorization(user: User, class_obj: ClassModel):
    """Enforces that only admin or the teacher assigned to the class can write attendance."""
    if user.role == "admin":
        return True

    if user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non-teacher users cannot record attendance."
        )

    if class_obj.teacher_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Unauthorized: You are not assigned as the teacher for class '{class_obj.name} - {class_obj.section}'."
        )

    return True


def record_attendance_bulk(
    db: Session,
    current_user: User,
    class_id: int,
    attendance_date: date,
    session_name: str,
    records: List[AttendanceItem],
    client_ip: Optional[str] = None
) -> List[Attendance]:
    # 1. Verify class exists
    class_obj = db.query(ClassModel).filter(ClassModel.id == class_id).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Class with ID {class_id} not found."
        )

    # 2. Verify authorization of user for this class
    verify_teacher_class_authorization(current_user, class_obj)

    # 3. Fetch all students belonging to this class for fast validation
    valid_students = db.query(Student).filter(
        Student.class_id == class_id,
        Student.status == "Active"
    ).all()
    valid_student_ids = {s.id: s for s in valid_students}

    # 4. Check for duplicate records already in DB for this date & session
    submitted_student_ids = [r.student_id for r in records]

    # Check for duplicates within the incoming payload itself
    if len(submitted_student_ids) != len(set(submitted_student_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate student records detected in the submission payload."
        )

    existing_attendances = db.query(Attendance).filter(
        Attendance.student_id.in_(submitted_student_ids),
        Attendance.date == attendance_date,
        Attendance.session == session_name
    ).all()

    if existing_attendances:
        conflict_ids = [str(a.student_id) for a in existing_attendances]
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance already recorded for student IDs [{', '.join(conflict_ids)}] on {attendance_date} ({session_name} session)."
        )

    # 5. Validate that all submitted students belong to this class
    new_records = []
    for item in records:
        if item.student_id not in valid_student_ids:
            # Check if student exists at all
            st = db.query(Student).filter(Student.id == item.student_id).first()
            if not st:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Student ID {item.student_id} not found."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Student '{st.full_name}' ({st.student_id}) does not belong to class '{class_obj.name} - {class_obj.section}'."
                )

        att = Attendance(
            student_id=item.student_id,
            class_id=class_id,
            recorded_by_id=current_user.id,
            date=attendance_date,
            session=session_name,
            status=item.status,
            remarks=item.remarks,
        )
        new_records.append(att)

    try:
        db.add_all(new_records)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance record conflict: duplicate entry violates database constraint."
        )

    for item in new_records:
        db.refresh(item)

    # Audit log
    log_audit(
        db=db,
        action="ATTENDANCE_RECORDED",
        entity_type="attendance",
        entity_id=f"class_{class_id}_{attendance_date}_{session_name}",
        user=current_user,
        details={
            "class_id": class_id,
            "date": str(attendance_date),
            "session": session_name,
            "total_submitted": len(new_records),
            "present": sum(1 for r in new_records if r.status == "Present"),
            "absent": sum(1 for r in new_records if r.status == "Absent"),
            "late": sum(1 for r in new_records if r.status == "Late"),
        },
        ip_address=client_ip
    )

    return new_records

