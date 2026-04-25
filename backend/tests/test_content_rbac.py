def _make_chapter(client, token):
    return client.post(
        "/api/chapters/",
        json={"title": "Chap", "description": "d", "order": 0, "is_published": True},
        headers={"Authorization": f"Bearer {token}"},
    )


def test_admin_can_crud_chapter(client, admin_token):
    r = _make_chapter(client, admin_token)
    assert r.status_code == 201
    chap_id = r.get_json()["chapter"]["id"]

    r = client.patch(
        f"/api/chapters/{chap_id}",
        json={"title": "New", "description": None, "order": 1, "is_published": False},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    assert r.get_json()["chapter"]["title"] == "New"

    r = client.delete(
        f"/api/chapters/{chap_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 204


def test_student_cannot_create_chapter(client, student_token):
    r = client.post(
        "/api/chapters/",
        json={"title": "x"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert r.status_code == 403


def test_student_only_sees_published(client, admin_token, student_token):
    # 2 chapters: 1 published, 1 draft
    client.post(
        "/api/chapters/",
        json={"title": "Pub", "order": 0, "is_published": True},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    client.post(
        "/api/chapters/",
        json={"title": "Draft", "order": 1, "is_published": False},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    # Anonymous → only published
    r = client.get("/api/chapters/")
    assert r.status_code == 200
    titles = [c["title"] for c in r.get_json()["chapters"]]
    assert titles == ["Pub"]

    # Student → only published
    r = client.get(
        "/api/chapters/",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert r.status_code == 200
    assert [c["title"] for c in r.get_json()["chapters"]] == ["Pub"]

    # Admin → both
    r = client.get(
        "/api/chapters/",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    assert {c["title"] for c in r.get_json()["chapters"]} == {"Pub", "Draft"}
