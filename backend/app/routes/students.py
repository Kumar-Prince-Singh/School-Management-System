import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.student import Student
from app.models.class_model import ClassModel
from app.models.user import User
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse, PaginatedStudentsResponse, ClassSummary
from app.auth.dependencies import get_current_user, require_teacher_or_admin, require_admin
from app.services.audit_service import log_audit

router = APIRouter(prefix="/students", tags=["Students"])


def build_student_response(student: Student) -> dict:
    class_summary = None
    if student.class_assigned:
        class_summary = {
            "id": student.class_assigned.id,
            "name": student.class_assigned.name,
            "section": student.class_assigned.section,
        }
    return {
        "id": student.id,
        "student_id": student.student_id,
        "full_name": student.full_name,
        "email": student.email,
        "phone": student.phone,
        "class_id": student.class_id,
        "enrollment_date": student.enrollment_date,
        "status": student.status,
        "class_assigned": class_summary,
        "created_at": student.created_at,
        "updated_at": student.updated_at,
    }


@router.get("", response_model=PaginatedStudentsResponse)
def get_students(
    search: Optional[str] = Query(None, description="Search by name, student_id or email"),
    class_id: Optional[int] = Query(None, description="Filter by class ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (Active/Inactive)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Student)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Student.full_name.ilike(search_pattern),
                Student.student_id.ilike(search_pattern),
                Student.email.ilike(search_pattern)
            )
        )

    if class_id:
        query = query.filter(Student.class_id == class_id)

    if status_filter:
        query = query.filter(Student.status == status_filter)

    total = query.count()
    pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size

    items = query.order_by(Student.full_name).offset(offset).limit(page_size).all()

    return {
        "items": [build_student_response(s) for s in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages
    }


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    request: Request,
    payload: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin)
):
    # Verify student_id uniqueness
    existing_code = db.query(Student).filter(Student.student_id == payload.student_id).first()
    if existing_code:
        raise HTTPException(status_code=400, detail=f"Student ID '{payload.student_id}' is already registered.")

    # Verify email uniqueness
    existing_email = db.query(Student).filter(Student.email == payload.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail=f"Email '{payload.email}' is already registered.")

    # Verify class exists
    target_class = db.query(ClassModel).filter(ClassModel.id == payload.class_id).first()
    if not target_class:
        raise HTTPException(status_code=400, detail="Assigned class does not exist.")

    new_student = Student(
        student_id=payload.student_id,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        class_id=payload.class_id,
        enrollment_date=payload.enrollment_date,
        status=payload.status,
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    client_ip = request.client.host if request.client else None
    log_audit(
        db=db,
        action="STUDENT_CREATED",
        entity_type="student",
        entity_id=str(new_student.id),
        user=current_user,
        details={"name": new_student.full_name, "student_id": new_student.student_id, "class_id": new_student.class_id},
        ip_address=client_ip
    )

    return build_student_response(new_student)


@router.get("/{id}", response_model=StudentResponse)
def get_student(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return build_student_response(student)


@router.put("/{id}", response_model=StudentResponse)
def update_student(
    id: int,
    request: Request,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin)
):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if payload.student_id and payload.student_id != student.student_id:
        existing = db.query(Student).filter(Student.student_id == payload.student_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Student ID already in use")
        student.student_id = payload.student_id

    if payload.email and payload.email != student.email:
        existing = db.query(Student).filter(Student.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        student.email = payload.email

    if payload.class_id and payload.class_id != student.class_id:
        cls = db.query(ClassModel).filter(ClassModel.id == payload.class_id).first()
        if not cls:
            raise HTTPException(status_code=400, detail="Assigned class does not exist")
        student.class_id = payload.class_id

    if payload.full_name is not None:
        student.full_name = payload.full_name
    if payload.phone is not None:
        student.phone = payload.phone
    if payload.enrollment_date is not None:
        student.enrollment_date = payload.enrollment_date
    if payload.status is not None:
        student.status = payload.status

    db.commit()
    db.refresh(student)

    client_ip = request.client.host if request.client else None
    log_audit(
        db=db,
        action="STUDENT_UPDATED",
        entity_type="student",
        entity_id=str(student.id),
        user=current_user,
        details={"name": student.full_name, "student_id": student.student_id},
        ip_address=client_ip
    )

    return build_student_response(student)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_info = f"{student.full_name} ({student.student_id})"
    db.delete(student)
    db.commit()

    client_ip = request.client.host if request.client else None
    log_audit(
        db=db,
        action="STUDENT_DELETED",
        entity_type="student",
        entity_id=str(id),
        user=current_user,
        details={"student_info": student_info},
        ip_address=client_ip
    )
    return None
