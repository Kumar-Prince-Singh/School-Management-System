from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class ClassBase(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Class 10"})
    section: str = Field(..., json_schema_extra={"example": "A"})
    academic_year: str = Field(..., json_schema_extra={"example": "2025-2026"})
    teacher_id: Optional[int] = None


class ClassCreate(ClassBase):
    pass


class ClassUpdate(BaseModel):
    name: Optional[str] = None
    section: Optional[str] = None
    academic_year: Optional[str] = None
    teacher_id: Optional[int] = None


class TeacherSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str


class ClassResponse(ClassBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_count: int = 0
    teacher: Optional[TeacherSummary] = None
    created_at: datetime
    updated_at: datetime
