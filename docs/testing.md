# Automated Testing & Verification Guide

**Project:** Cloud Deployment & CI/CD – School Management Platform  
**Candidate:** Prince Kumar (Reg: 12314718)  
**Company:** ALGIONS AI LABS PRIVATE LIMITED  

---

## 1. Testing Strategy & Isolation

The automated test suite is built with **Pytest** and FastAPI's `TestClient`.

### Isolation Guarantee:
- Tests execute against an isolated **in-memory SQLite database** with `StaticPool` (`sqlite:///:memory:`).
- `get_db` dependency injection is cleanly overridden per test fixture.
- **Zero impact** on development or production PostgreSQL instances.
- Pre-seeded synthetic test fixtures verify authorization and database constraints reproducibly.

---

## 2. Acceptance Tests Compliance Matrix

All 5 mandatory assessment acceptance tests are implemented in `backend/tests/test_attendance.py`:

| Test ID | Test Description | Input / Action | Expected Result | Actual Result |
|---|---|---|---|---|
| **Test 1** | Non-teacher authorization gate | Staff user attempts `POST /api/attendance` | **HTTP 403 Forbidden** | `403 Forbidden` (`detail: Non-teacher users cannot record attendance`) |
| **Test 2** | Teacher-class lock enforcement | Teacher B attempts `POST /api/attendance` for Class 10-A | **HTTP 403 Forbidden** | `403 Forbidden` (`detail: Unauthorized: You are not assigned as the teacher...`) |
| **Test 3** | Authorized teacher attendance | Teacher A records attendance for Class 10-A | **HTTP 201 Created** | `201 Created` (Attendance records created & audited) |
| **Test 4** | Class membership constraint | Submitting student belonging to Class B under Class A | **HTTP 400 Bad Request** | `400 Bad Request` (`detail: Student does not belong to class...`) |
| **Test 5** | Duplicate attendance rejection | Second submission for same student, date, and session | **HTTP 409 Conflict** | `409 Conflict` (`detail: Attendance already recorded...`) |

---

## 3. Running the Test Suite Locally

### Option A: From Activated Virtual Environment
```bash
# Windows
backend\venv\Scripts\pytest backend\tests -v

# Linux / macOS
source backend/venv/bin/activate
pytest backend/tests -v
```

### Option B: Using Pipenv / Direct Python Invocation
```bash
python -m pytest backend/tests -v
```

### Expected Output Summary:
```text
============================= test session starts =============================
platform win32 -- Python 3.11.5, pytest-9.2.0, pluggy-1.7.0
collected 20 items

backend/tests/test_attendance.py::test_1_non_teacher_cannot_record_attendance PASSED [  5%]
backend/tests/test_attendance.py::test_2_unassigned_teacher_cannot_record_attendance PASSED [ 10%]
backend/tests/test_attendance.py::test_3_authorized_teacher_can_record_attendance PASSED [ 15%]
backend/tests/test_attendance.py::test_4_student_not_in_class_rejected PASSED [ 20%]
backend/tests/test_attendance.py::test_5_duplicate_attendance_rejected PASSED [ 25%]
backend/tests/test_auth.py::test_login_success PASSED                    [ 30%]
backend/tests/test_auth.py::test_login_invalid_password PASSED           [ 35%]
backend/tests/test_auth.py::test_login_nonexistent_user PASSED           [ 40%]
backend/tests/test_auth.py::test_get_current_user_me PASSED              [ 45%]
backend/tests/test_classes.py::test_get_classes_list PASSED              [ 50%]
backend/tests/test_classes.py::test_create_class_by_admin PASSED         [ 55%]
backend/tests/test_classes.py::test_create_class_forbidden_for_teacher PASSED [ 60%]
backend/tests/test_health.py::test_health_endpoint PASSED                [ 65%]
backend/tests/test_health.py::test_ready_endpoint PASSED                 [ 70%]
backend/tests/test_health.py::test_root_endpoint PASSED                  [ 75%]
backend/tests/test_students.py::test_get_students_list PASSED            [ 80%]
backend/tests/test_students.py::test_create_student_success PASSED       [ 85%]
backend/tests/test_students.py::test_create_student_duplicate_id_rejected PASSED [ 90%]
backend/tests/test_students.py::test_get_student_by_id PASSED            [ 95%]
backend/tests/test_students.py::test_delete_student_by_admin PASSED      [100%]

============================== 20 passed in 16.89s ==============================
```

