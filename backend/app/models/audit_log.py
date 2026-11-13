from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    username = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False, index=True)  # ATTENDANCE_RECORDED, STUDENT_CREATED, etc.
    entity_type = Column(String(50), nullable=False)  # student, class, attendance, auth
    entity_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)  # JSON or descriptive text
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
