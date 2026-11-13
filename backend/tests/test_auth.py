def test_login_success(client, seed_test_data):
    response = client.post("/api/auth/login", json={
        "username_or_email": "admin_test",
        "password": "TestPass@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "admin_test"
    assert data["user"]["role"] == "admin"


def test_login_invalid_password(client, seed_test_data):
    response = client.post("/api/auth/login", json={
        "username_or_email": "admin_test",
        "password": "WrongPassword123"
    })
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]


def test_login_nonexistent_user(client, seed_test_data):
    response = client.post("/api/auth/login", json={
        "username_or_email": "unknown_user",
        "password": "AnyPassword"
    })
    assert response.status_code == 401


def test_get_current_user_me(client, seed_test_data):
    token = seed_test_data["tokens"]["teacher_a"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "teacher_a_test"
    assert data["role"] == "teacher"

