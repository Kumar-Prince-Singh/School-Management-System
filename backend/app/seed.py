import logging
from datetime import date, timedelta
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.class_model import ClassModel
from app.models.student import Student
from app.models.attendance import Attendance
from app.models.audit_log import AuditLog
from app.auth.security import get_password_hash

logger = logging.getLogger("school_platform.seed")


def seed_database():
    """Seeds synthetic demo data for ALGIONS AI LABS review."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if existing_admin:
            logger.info("Database is already seeded. Skipping initial seed.")
            return

        logger.info("Starting synthetic database seeding...")

        # 1. Create Users
        admin_user = User(
            username="admin",
            email="admin@algions.edu",
            full_name="Prince Kumar (Administrator)",
            hashed_password=get_password_hash("Admin@123"),
            role="admin",
            is_active=True,
        )

        teacher_a = User(
            username="teacher.a",
            email="teacher.a@algions.edu",
            full_name="Dr. Vikram Malhotra",
            hashed_password=get_password_hash("Teacher@123"),
            role="teacher",
            is_active=True,
        )

        teacher_b = User(
            username="teacher.b",
            email="teacher.b@algions.edu",
            full_name="Prof. Ananya Sen",
            hashed_password=get_password_hash("Teacher@123"),
            role="teacher",
            is_active=True,
        )

        teacher_c = User(
            username="teacher.c",
            email="teacher.c@algions.edu",
            full_name="Prof. Rajesh Kulkarni",
            hashed_password=get_password_hash("Teacher@123"),
            role="teacher",
            is_active=True,
        )

        staff_user = User(
            username="staff",
            email="staff@algions.edu",
            full_name="Rohan Verma (Academic Counselor)",
            hashed_password=get_password_hash("Staff@123"),
            role="staff",
            is_active=True,
        )

        db.add_all([admin_user, teacher_a, teacher_b, teacher_c, staff_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(teacher_a)
        db.refresh(teacher_b)
        db.refresh(teacher_c)

        # 2. Create Classes
        class_10a = ClassModel(
            name="Class 10",
            section="A",
            academic_year="2025-2026",
            teacher_id=teacher_a.id,
        )
        class_10b = ClassModel(
            name="Class 10",
            section="B",
            academic_year="2025-2026",
            teacher_id=teacher_b.id,
        )
        class_11a = ClassModel(
            name="Class 11",
            section="A",
            academic_year="2025-2026",
            teacher_id=teacher_c.id,
        )
        class_11b = ClassModel(
            name="Class 11",
            section="B",
            academic_year="2025-2026",
            teacher_id=None,  # Unassigned class for testing assignment workflows
        )

        db.add_all([class_10a, class_10b, class_11a, class_11b])
        db.commit()
        db.refresh(class_10a)
        db.refresh(class_10b)
        db.refresh(class_11a)
        db.refresh(class_11b)

        # 3. Create 24 Synthetic Students
        synthetic_students = [
            # Class 10-A Students (assigned to Teacher A)
            {"id": "STU-2025-001", "name": "Aarav Sharma", "email": "aarav.sharma@algions.edu", "phone": "+91 98765 43210", "class_id": class_10a.id},
            {"id": "STU-2025-002", "name": "Diya Patel", "email": "diya.patel@algions.edu", "phone": "+91 98765 43211", "class_id": class_10a.id},
            {"id": "STU-2025-003", "name": "Ishaan Verma", "email": "ishaan.verma@algions.edu", "phone": "+91 98765 43212", "class_id": class_10a.id},
            {"id": "STU-2025-004", "name": "Kavya Iyer", "email": "kavya.iyer@algions.edu", "phone": "+91 98765 43213", "class_id": class_10a.id},
            {"id": "STU-2025-005", "name": "Reyansh Gupta", "email": "reyansh.gupta@algions.edu", "phone": "+91 98765 43214", "class_id": class_10a.id},
            {"id": "STU-2025-006", "name": "Saanvi Joshi", "email": "saanvi.joshi@algions.edu", "phone": "+91 98765 43215", "class_id": class_10a.id},

            # Class 10-B Students (assigned to Teacher B)
            {"id": "STU-2025-007", "name": "Arjun Nair", "email": "arjun.nair@algions.edu", "phone": "+91 98765 43216", "class_id": class_10b.id},
            {"id": "STU-2025-008", "name": "Ananya Reddy", "email": "ananya.reddy@algions.edu", "phone": "+91 98765 43217", "class_id": class_10b.id},
            {"id": "STU-2025-009", "name": "Kabir Das", "email": "kabir.das@algions.edu", "phone": "+91 98765 43218", "class_id": class_10b.id},
            {"id": "STU-2025-010", "name": "Meera Banerjee", "email": "meera.banerjee@algions.edu", "phone": "+91 98765 43219", "class_id": class_10b.id},
            {"id": "STU-2025-011", "name": "Vihaan Choudhury", "email": "vihaan.choudhury@algions.edu", "phone": "+91 98765 43220", "class_id": class_10b.id},
            {"id": "STU-2025-012", "name": "Tanvi Kapoor", "email": "tanvi.kapoor@algions.edu", "phone": "+91 98765 43221", "class_id": class_10b.id},

            # Class 11-A Students (assigned to Teacher C)
            {"id": "STU-2025-013", "name": "Aditya Rao", "email": "aditya.rao@algions.edu", "phone": "+91 98765 43222", "class_id": class_11a.id},
            {"id": "STU-2025-014", "name": "Rhea Menon", "email": "rhea.menon@algions.edu", "phone": "+91 98765 43223", "class_id": class_11a.id},
            {"id": "STU-2025-015", "name": "Siddharth Jain", "email": "siddharth.jain@algions.edu", "phone": "+91 98765 43224", "class_id": class_11a.id},
            {"id": "STU-2025-016", "name": "Pooja Hegde", "email": "pooja.hegde@algions.edu", "phone": "+91 98765 43225", "class_id": class_11a.id},
            {"id": "STU-2025-017", "name": "Devansh Mishra", "email": "devansh.mishra@algions.edu", "phone": "+91 98765 43226", "class_id": class_11a.id},
            {"id": "STU-2025-018", "name": "Zara Khan", "email": "zara.khan@algions.edu", "phone": "+91 98765 43227", "class_id": class_11a.id},

            # Class 11-B Students
            {"id": "STU-2025-019", "name": "Rohan Deshmukh", "email": "rohan.deshmukh@algions.edu", "phone": "+91 98765 43228", "class_id": class_11b.id},
            {"id": "STU-2025-020", "name": "Avani Kulkarni", "email": "avani.kulkarni@algions.edu", "phone": "+91 98765 43229", "class_id": class_11b.id},
            {"id": "STU-2025-021", "name": "Karan Bhatia", "email": "karan.bhatia@algions.edu", "phone": "+91 98765 43230", "class_id": class_11b.id},
            {"id": "STU-2025-022", "name": "Neha Nambiar", "email": "neha.nambiar@algions.edu", "phone": "+91 98765 43231", "class_id": class_11b.id},
            {"id": "STU-2025-023", "name": "Manish Pillai", "email": "manish.pillai@algions.edu", "phone": "+91 98765 43232", "class_id": class_11b.id},
            {"id": "STU-2025-024", "name": "Shruti Saxena", "email": "shruti.saxena@algions.edu", "phone": "+91 98765 43233", "class_id": class_11b.id},
        ]

        created_students = []
        for s in synthetic_students:
            student_obj = Student(
                student_id=s["id"],
                full_name=s["name"],
                email=s["email"],
                phone=s["phone"],
                class_id=s["class_id"],
                enrollment_date=date(2025, 6, 15),
                status="Active",
            )
            created_students.append(student_obj)

        db.add_all(created_students)
        db.commit()

        # Refresh students
        for s in created_students:
            db.refresh(s)

        # 4. Create Historical Attendance Records for Past 5 Days
        today = date.today()
        attendance_records = []
        classes_with_teachers = [
            (class_10a, teacher_a, created_students[0:6]),
            (class_10b, teacher_b, created_students[6:12]),
            (class_11a, teacher_c, created_students[12:18]),
        ]

        for day_offset in range(4, -1, -1):
            record_date = today - timedelta(days=day_offset)
            # Skip Sundays
            if record_date.weekday() == 6:
                continue

            for cls, teacher, students in classes_with_teachers:
                for idx, student in enumerate(students):
                    # Rotate some statuses for realistic demonstration
                    if idx == 4 and day_offset in (1, 3):
                        status_val = "Absent"
                        remarks = "Medical leave notified"
                    elif idx == 5 and day_offset == 2:
                        status_val = "Late"
                        remarks = "School bus delay"
                    else:
                        status_val = "Present"
                        remarks = None

                    att = Attendance(
                        student_id=student.id,
                        class_id=cls.id,
                        recorded_by_id=teacher.id,
                        date=record_date,
                        session="Morning",
                        status=status_val,
                        remarks=remarks,
                    )
                    attendance_records.append(att)

        db.add_all(attendance_records)
        db.commit()

        # 5. Add initial Audit Log entries
        audit_1 = AuditLog(
            user_id=admin_user.id,
            username="admin",
            action="SYSTEM_INIT",
            entity_type="system",
            entity_id="init-001",
            details="System initialized and synthetic demo data seeded successfully.",
        )
        audit_2 = AuditLog(
            user_id=teacher_a.id,
            username="teacher.a",
            action="ATTENDANCE_RECORDED",
            entity_type="attendance",
            entity_id=f"class_{class_10a.id}_{today}_Morning",
            details=f"Attendance recorded for Class 10 - A (Morning Session). 6 students marked.",
        )
        db.add_all([audit_1, audit_2])
        db.commit()

        logger.info("Synthetic database seeding completed successfully.")
        print("Database seeded with 5 users, 4 classes, 24 students, and historical attendance records.")

    except Exception as e:
        db.rollback()
        logger.error(f"Seeding failed: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

