from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class ClassModel(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)  # e.g., "Class 10"
    section = Column(String(10), nullable=False)  # e.g., "A"
    academic_year = Column(String(20), nullable=False)  # e.g., "2025-2026"
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    teacher = relationship("User", back_populates="assigned_classes")
    students = relationship("Student", back_populates="class_assigned", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="class_ref", cascade="all, delete-orphan")

