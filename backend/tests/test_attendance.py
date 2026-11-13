from datetime import date
import pytest


def test_1_non_teacher_cannot_record_attendance(client, seed_test_data):
    """Acceptance Test 1: A non-teacher user (e.g. staff) must not be able to record attendance.
    Expected: HTTP 403 Forbidden.
    """
    staff_token = seed_test_data["tokens"]["staff"]
    class_a_id = seed_test_data["class_a"].id
    student_a_id = seed_test_data["student_a1"].id

    payload = {
        "class_id": class_a_id,
        "date": str(date.today()),
        "session": "Morning",
        "records": [
            {"student_id": student_a_id, "status": "Present", "remarks": None}
        ]
    }

    headers = {"Authorization": f"Bearer {staff_token}"}
    response = client.post("/api/attendance", json=payload, headers=headers)

    assert response.status_code == 403
    assert "Non-teacher users cannot record attendance" in response.json()["detail"]


def test_2_unassigned_teacher_cannot_record_attendance(client, seed_test_data):
    """Acceptance Test 2: An unassigned teacher must not be able to record attendance for another teacher's class.
    Teacher B attempting to record attendance for Class A.
    Expected: HTTP 403 Forbidden.
    """
    teacher_b_token = seed_test_data["tokens"]["teacher_b"]
    class_a_id = seed_test_data["class_a"].id
    student_a_id = seed_test_data["student_a1"].id

    payload = {
        "class_id": class_a_id,
        "date": str(date.today()),
        "session": "Morning",
        "records": [
            {"student_id": student_a_id, "status": "Present", "remarks": None}
        ]
    }

    headers = {"Authorization": f"Bearer {teacher_b_token}"}
    response = client.post("/api/attendance", json=payload, headers=headers)

    assert response.status_code == 403
    assert "Unauthorized: You are not assigned as the teacher" in response.json()["detail"]


def test_3_authorized_teacher_can_record_attendance(client, seed_test_data):
    """Acceptance Test 3: An authorized teacher must be able to record attendance for an assigned class.
    Teacher A recording attendance for Class A.
    Expected: Successful response (HTTP 201).
    """
    teacher_a_token = seed_test_data["tokens"]["teacher_a"]
    class_a_id = seed_test_data["class_a"].id
    student_a_id = seed_test_data["student_a1"].id

    payload = {
        "class_id": class_a_id,
        "date": str(date.today()),
        "session": "Morning",
        "records": [
            {"student_id": student_a_id, "status": "Present", "remarks": "On time"}
        ]
    }

    headers = {"Authorization": f"Bearer {teacher_a_token}"}
    response = client.post("/api/attendance", json=payload, headers=headers)

    assert response.status_code == 201
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["student_id"] == student_a_id
    assert data[0]["status"] == "Present"
    assert data[0]["session"] == "Morning"


def test_4_student_not_in_class_rejected(client, seed_test_data):
    """Acceptance Test 4: A student who does not belong to the selected class must not be allowed in attendance.
    Submitting Student B (belongs to Class B) in Class A attendance.
    Expected: Validation error (HTTP 400 Bad Request).
    """
    teacher_a_token = seed_test_data["tokens"]["teacher_a"]
    class_a_id = seed_test_data["class_a"].id
    student_b_id = seed_test_data["student_b1"].id  # Belongs to Class B!

    payload = {
        "class_id": class_a_id,
        "date": str(date.today()),
        "session": "Morning",
        "records": [
            {"student_id": student_b_id, "status": "Present", "remarks": None}
        ]
    }

    headers = {"Authorization": f"Bearer {teacher_a_token}"}
    response = client.post("/api/attendance", json=payload, headers=headers)

    assert response.status_code == 400
    assert "does not belong to class" in response.json()["detail"]


def test_5_duplicate_attendance_rejected(client, seed_test_data):
    """Acceptance Test 5: Duplicate attendance for the same student, date and session must be rejected.
    Expected: Conflict or validation error (HTTP 409 Conflict).
    """
    teacher_a_token = seed_test_data["tokens"]["teacher_a"]
    class_a_id = seed_test_data["class_a"].id
    student_a_id = seed_test_data["student_a1"].id

    payload = {
        "class_id": class_a_id,
        "date": str(date.today()),
        "session": "Morning",
        "records": [
            {"student_id": student_a_id, "status": "Present", "remarks": "Initial submission"}
        ]
    }

    headers = {"Authorization": f"Bearer {teacher_a_token}"}

    # First submission should succeed
    res1 = client.post("/api/attendance", json=payload, headers=headers)
    assert res1.status_code == 201

    # Second submission with same student, date, and session must be rejected
    res2 = client.post("/api/attendance", json=payload, headers=headers)
    assert res2.status_code == 409
    assert "Attendance already recorded" in res2.json()["detail"]

