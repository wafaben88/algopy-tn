def test_register_login_me(client):
    r = client.post(
        "/api/auth/register",
        json={"email": "alice@example.com", "name": "Alice", "password": "secret123"},
    )
    assert r.status_code == 201
    assert r.get_json()["user"]["role"] == "student"
    token = r.get_json()["access_token"]

    r2 = client.post(
        "/api/auth/login",
        json={"email": "alice@example.com", "password": "secret123"},
    )
    assert r2.status_code == 200

    r3 = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r3.status_code == 200
    assert r3.get_json()["user"]["email"] == "alice@example.com"


def test_login_wrong_password(client):
    client.post(
        "/api/auth/register",
        json={"email": "x@example.com", "name": "X", "password": "abcdefgh"},
    )
    r = client.post(
        "/api/auth/login",
        json={"email": "x@example.com", "password": "WRONG-PASSWORD"},
    )
    assert r.status_code == 401


def test_register_duplicate_email(client):
    payload = {"email": "dup@example.com", "name": "Y", "password": "abcdefgh"}
    assert client.post("/api/auth/register", json=payload).status_code == 201
    assert client.post("/api/auth/register", json=payload).status_code == 400


def test_register_validation(client):
    r = client.post("/api/auth/register", json={"email": "bad", "name": "", "password": "x"})
    assert r.status_code == 400
