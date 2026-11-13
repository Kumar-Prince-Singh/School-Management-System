def test_get_students_list(client, seed_test_data):
    token = seed_test_data["tokens"]["admin"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/students", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] == 2
    assert len(data["items"]) == 2


def test_create_student_success(client, seed_test_data):
    token = seed_test_data["tokens"]["admin"]
    class_a_id = seed_test_data["class_a"].id
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "student_id": "STU-NEW-999",
        "full_name": "New Student Synthetic",
        "email": "new.student@test.edu",
        "phone": "+91 9999900099",
        "class_id": class_a_id,
        "enrollment_date": "2025-06-01",
        "status": "Active"
    }

    response = client.post("/api/students", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["student_id"] == "STU-NEW-999"
    assert data["full_name"] == "New Student Synthetic"


def test_create_student_duplicate_id_rejected(client, seed_test_data):
    token = seed_test_data["tokens"]["admin"]
    class_a_id = seed_test_data["class_a"].id
    headers = {"Authorization": f"Bearer {token}"}

    # "STU-A-001" is already seeded
    payload = {
        "student_id": "STU-A-001",
        "full_name": "Duplicate Student",
        "email": "another.email@test.edu",
        "phone": "+91 9999900088",
        "class_id": class_a_id,
        "enrollment_date": "2025-06-01",
        "status": "Active"
    }

    response = client.post("/api/students", json=payload, headers=headers)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_get_student_by_id(client, seed_test_data):
    token = seed_test_data["tokens"]["teacher_a"]
    student_id = seed_test_data["student_a1"].id
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get(f"/api/students/{student_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == student_id


def test_delete_student_by_admin(client, seed_test_data):
    admin_token = seed_test_data["tokens"]["admin"]
    student_id = seed_test_data["student_a1"].id
    headers = {"Authorization": f"Bearer {admin_token}"}

    response = client.delete(f"/api/students/{student_id}", headers=headers)
    assert response.status_code == 204

    # Confirm deletion
    get_res = client.get(f"/api/students/{student_id}", headers=headers)
    assert get_res.status_code == 404
