from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.class_model import ClassModel
from app.models.student import Student
from app.models.user import User
from app.schemas.class_schema import ClassCreate, ClassUpdate, ClassResponse, TeacherSummary
from app.auth.dependencies import get_current_user, require_admin
from app.services.audit_service import log_audit

router = APIRouter(prefix="/classes", tags=["Classes"])


def build_class_response(cls: ClassModel, db: Session) -> dict:
    count = db.query(func.count(Student.id)).filter(Student.class_id == cls.id).scalar() or 0
    teacher_summary = None
    if cls.teacher:
        teacher_summary = {
            "id": cls.teacher.id,
            "full_name": cls.teacher.full_name,
            "email": cls.teacher.email,
        }
    return {
        "id": cls.id,
        "name": cls.name,
        "section": cls.section,
        "academic_year": cls.academic_year,
        "teacher_id": cls.teacher_id,
        "student_count": count,
        "teacher": teacher_summary,
        "created_at": cls.created_at,
        "updated_at": cls.updated_at,
    }


@router.get("", response_model=List[ClassResponse])
def get_classes(
    search: Optional[str] = None,
    academic_year: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ClassModel)
    if search:
        query = query.filter(
            (ClassModel.name.ilike(f"%{search}%")) |
            (ClassModel.section.ilike(f"%{search}%"))
        )
    if academic_year:
        query = query.filter(ClassModel.academic_year == academic_year)

    classes = query.order_by(ClassModel.name, ClassModel.section).all()
    return [build_class_response(cls, db) for cls in classes]


@router.post("", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
def create_class(
    request: Request,
    payload: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    if payload.teacher_id:
        teacher = db.query(User).filter(User.id == payload.teacher_id).first()
        if not teacher:
            raise HTTPException(status_code=400, detail="Assigned teacher does not exist.")

    new_class = ClassModel(
        name=payload.name,
        section=payload.section,
        academic_year=payload.academic_year,
        teacher_id=payload.teacher_id
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)

    client_ip = request.client.host if request.client else None
    log_audit(
        db=db,
        action="CLASS_CREATED",
        entity_type="class",
        entity_id=str(new_class.id),
        user=current_user,
        details={"name": new_class.name, "section": new_class.section, "year": new_class.academic_year},
        ip_address=client_ip
    )

    return build_class_response(new_class, db)


@router.get("/{id}", response_model=ClassResponse)
def get_class(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cls = db.query(ClassModel).filter(ClassModel.id == id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    return build_class_response(cls, db)


@router.put("/{id}", response_model=ClassResponse)
def update_class(
    id: int,
    request: Request,
    payload: ClassUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    cls = db.query(ClassModel).filter(ClassModel.id == id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    if payload.teacher_id is not None:
        teacher = db.query(User).filter(User.id == payload.teacher_id).first()
        if not teacher:
            raise HTTPException(status_code=400, detail="Assigned teacher does not exist.")
        cls.teacher_id = payload.teacher_id

    if payload.name is not None:
        cls.name = payload.name
    if payload.section is not None:
        cls.section = payload.section
    if payload.academic_year is not None:
        cls.academic_year = payload.academic_year

    db.commit()
    db.refresh(cls)

    client_ip = request.client.host if request.client else None
    log_audit(
        db=db,
        action="CLASS_UPDATED",
        entity_type="class",
        entity_id=str(cls.id),
        user=current_user,
        details={"name": cls.name, "section": cls.section},
        ip_address=client_ip
    )

    return build_class_response(cls, db)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    cls = db.query(ClassModel).filter(ClassModel.id == id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    name = f"{cls.name} - {cls.section}"
    db.delete(cls)
    db.commit()

    client_ip = request.client.host if request.client else None
    log_audit(
        db=db,
        action="CLASS_DELETED",
        entity_type="class",
        entity_id=str(id),
        user=current_user,
        details={"class_name": name},
        ip_address=client_ip
    )
    return None

