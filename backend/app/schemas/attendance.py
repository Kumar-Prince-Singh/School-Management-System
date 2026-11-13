from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import date, datetime


class AttendanceItem(BaseModel):
    student_id: int
    status: str = Field(..., json_schema_extra={"example": "Present"})  # Present, Absent, Late
    remarks: Optional[str] = None


class AttendanceBulkCreate(BaseModel):
    class_id: int
    date: date
    session: str = Field(default="Morning", json_schema_extra={"example": "Morning"})  # Morning, Afternoon
    records: List[AttendanceItem]


class AttendanceCreateSingle(BaseModel):
    student_id: int
    class_id: int
    date: date
    session: str = Field(default="Morning", json_schema_extra={"example": "Morning"})
    status: str = Field(..., json_schema_extra={"example": "Present"})
    remarks: Optional[str] = None


class AttendanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    class_id: int
    recorded_by_id: Optional[int]
    date: date
    session: str
    status: str
    remarks: Optional[str] = None
    created_at: datetime
    student_name: Optional[str] = None
    student_code: Optional[str] = None
    class_name: Optional[str] = None


class AttendanceReportItem(BaseModel):
    date: date
    class_id: int
    class_name: str
    session: str
    total_students: int
    present_count: int
    absent_count: int
    late_count: int
    attendance_rate: float


class AttendanceReportResponse(BaseModel):
    summary: dict
    records: List[AttendanceReportItem]
