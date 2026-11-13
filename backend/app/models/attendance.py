from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    date = Column(Date, nullable=False, index=True)
    session = Column(String(20), nullable=False, default="Morning")  # Morning, Afternoon
    status = Column(String(20), nullable=False)  # Present, Absent, Late
    remarks = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="attendances")
    class_ref = relationship("ClassModel", back_populates="attendances")
    recorded_by = relationship("User", back_populates="recorded_attendances")

    # Table constraints
    __table_args__ = (
        UniqueConstraint("student_id", "date", "session", name="uq_student_date_session"),
    )
