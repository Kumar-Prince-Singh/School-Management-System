from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    enrollment_date = Column(Date, default=date.today, nullable=False)
    status = Column(String(20), default="Active", nullable=False)  # Active, Inactive, Suspended
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    class_assigned = relationship("ClassModel", back_populates="students")
    attendances = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
