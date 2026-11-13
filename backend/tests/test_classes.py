def test_get_classes_list(client, seed_test_data):
    token = seed_test_data["tokens"]["teacher_a"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/classes", headers=headers)
    assert response.status_code == 200
    classes = response.json()
    assert len(classes) == 2
    assert classes[0]["name"] == "Class 10"


def test_create_class_by_admin(client, seed_test_data):
    token = seed_test_data["tokens"]["admin"]
    teacher_b_id = seed_test_data["teacher_b"].id
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "name": "Class 12",
        "section": "Science",
        "academic_year": "2025-2026",
        "teacher_id": teacher_b_id,
    }

    response = client.post("/api/classes", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Class 12"
    assert data["section"] == "Science"
    assert data["teacher"]["id"] == teacher_b_id


def test_create_class_forbidden_for_teacher(client, seed_test_data):
    token = seed_test_data["tokens"]["teacher_a"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "name": "Class 12",
        "section": "Commerce",
        "academic_year": "2025-2026",
    }

    response = client.post("/api/classes", json=payload, headers=headers)
    assert response.status_code == 403
