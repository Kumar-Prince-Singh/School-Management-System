import os
import sys

# Ensure test environment uses SQLite
os.environ["DATABASE_URL"] = "sqlite:///./test_school.db"
os.environ["ENVIRONMENT"] = "testing"

# Ensure backend root is on Python sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import date

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.class_model import ClassModel
from app.models.student import Student
from app.auth.security import get_password_hash, create_access_token

# Isolated in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite:///:memory:"

engine_test = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine_test)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine_test)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def seed_test_data(db_session):
    """Creates initial users, classes, and students in the isolated test DB."""
    # 1. Users
    admin = User(
        username="admin_test",
        email="admin@test.edu",
        full_name="Admin Test",
        hashed_password=get_password_hash("TestPass@123"),
        role="admin",
        is_active=True,
    )
    teacher_a = User(
        username="teacher_a_test",
        email="teacher_a@test.edu",
        full_name="Teacher A Test",
        hashed_password=get_password_hash("TestPass@123"),
        role="teacher",
        is_active=True,
    )
    teacher_b = User(
        username="teacher_b_test",
        email="teacher_b@test.edu",
        full_name="Teacher B Test",
        hashed_password=get_password_hash("TestPass@123"),
        role="teacher",
        is_active=True,
    )
    staff = User(
        username="staff_test",
        email="staff@test.edu",
        full_name="Staff Test",
        hashed_password=get_password_hash("TestPass@123"),
        role="staff",
        is_active=True,
    )

    db_session.add_all([admin, teacher_a, teacher_b, staff])
    db_session.commit()
    db_session.refresh(admin)
    db_session.refresh(teacher_a)
    db_session.refresh(teacher_b)
    db_session.refresh(staff)

    # 2. Classes
    class_a = ClassModel(
        name="Class 10",
        section="A",
        academic_year="2025-2026",
        teacher_id=teacher_a.id,
    )
    class_b = ClassModel(
        name="Class 10",
        section="B",
        academic_year="2025-2026",
        teacher_id=teacher_b.id,
    )
    db_session.add_all([class_a, class_b])
    db_session.commit()
    db_session.refresh(class_a)
    db_session.refresh(class_b)

    # 3. Students
    student_a1 = Student(
        student_id="STU-A-001",
        full_name="Student in Class A",
        email="student.a@test.edu",
        phone="+91 9999900001",
        class_id=class_a.id,
        enrollment_date=date.today(),
        status="Active",
    )
    student_b1 = Student(
        student_id="STU-B-001",
        full_name="Student in Class B",
        email="student.b@test.edu",
        phone="+91 9999900002",
        class_id=class_b.id,
        enrollment_date=date.today(),
        status="Active",
    )
    db_session.add_all([student_a1, student_b1])
    db_session.commit()
    db_session.refresh(student_a1)
    db_session.refresh(student_b1)

    # Pre-generate JWT tokens
    admin_token = create_access_token(subject=admin.id, role="admin")
    teacher_a_token = create_access_token(subject=teacher_a.id, role="teacher")
    teacher_b_token = create_access_token(subject=teacher_b.id, role="teacher")
    staff_token = create_access_token(subject=staff.id, role="staff")

    return {
        "admin": admin,
        "teacher_a": teacher_a,
        "teacher_b": teacher_b,
        "staff": staff,
        "class_a": class_a,
        "class_b": class_b,
        "student_a1": student_a1,
        "student_b1": student_b1,
        "tokens": {
            "admin": admin_token,
            "teacher_a": teacher_a_token,
            "teacher_b": teacher_b_token,
            "staff": staff_token,
        }
    }
