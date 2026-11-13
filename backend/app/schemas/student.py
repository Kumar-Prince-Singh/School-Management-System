from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import date, datetime


class StudentBase(BaseModel):
    student_id: str = Field(..., json_schema_extra={"example": "STU-2025-001"})
    full_name: str = Field(..., json_schema_extra={"example": "Aarav Sharma"})
    email: EmailStr = Field(..., json_schema_extra={"example": "aarav.sharma@algions.edu"})
    phone: str = Field(..., json_schema_extra={"example": "+91 9876543210"})
    class_id: int
    enrollment_date: date = Field(default_factory=date.today)
    status: str = Field(default="Active", json_schema_extra={"example": "Active"})


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    student_id: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    class_id: Optional[int] = None
    enrollment_date: Optional[date] = None
    status: Optional[str] = None


class ClassSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    section: str


class StudentResponse(StudentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    class_assigned: Optional[ClassSummary] = None
    created_at: datetime
    updated_at: datetime


class PaginatedStudentsResponse(BaseModel):
    items: List[StudentResponse]
    total: int
    page: int
    page_size: int
    pages: int
