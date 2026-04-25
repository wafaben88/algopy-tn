"""Image upload + protected serving."""

from __future__ import annotations

import io

import pytest
from PIL import Image


def _png_bytes(color=(50, 80, 180)) -> bytes:
    img = Image.new("RGB", (40, 40), color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture()
def lesson_id(client, admin_token) -> int:
    """Create a published chapter→section→lesson and return the lesson id."""
    chap = client.post(
        "/api/chapters/",
        json={"title": "C", "order": 0, "is_published": True},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    cid = chap.get_json()["chapter"]["id"]
    sec = client.post(
        "/api/sections/",
        json={"chapter_id": cid, "title": "S", "order": 0},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    sid = sec.get_json()["section"]["id"]
    lsn = client.post(
        "/api/lessons/",
        json={
            "section_id": sid,
            "title": "L",
            "theory_content": "theory",
            "order": 0,
            "is_published": True,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    return lsn.get_json()["lesson"]["id"]


def _upload(client, token, lesson_id):
    return client.post(
        f"/api/lessons/{lesson_id}/images",
        data={"file": (io.BytesIO(_png_bytes()), "diag.png")},
        headers={"Authorization": f"Bearer {token}"},
        content_type="multipart/form-data",
    )


def test_admin_uploads_image_and_can_fetch(client, admin_token, lesson_id):
    r = _upload(client, admin_token, lesson_id)
    assert r.status_code == 201
    image = r.get_json()["image"]
    assert image["mime_type"] == "image/png"
    assert image["width"] == 40
    assert image["is_protected"] is True
    token = image["token"]

    r = client.get(
        f"/api/secure-image/{token}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    assert r.headers["Content-Type"] == "image/png"
    assert "no-store" in r.headers["Cache-Control"]
    assert r.headers["X-Content-Type-Options"] == "nosniff"
    assert r.headers["Content-Disposition"].startswith("inline")
    # PNG magic
    assert r.data[:8] == b"\x89PNG\r\n\x1a\n"


def test_student_cannot_use_admins_token(client, admin_token, student_token, lesson_id):
    upload = _upload(client, admin_token, lesson_id).get_json()
    admin_image_token = upload["image"]["token"]

    r = client.get(
        f"/api/secure-image/{admin_image_token}",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert r.status_code == 403


def test_student_can_fetch_own_token(client, admin_token, student_token, lesson_id):
    _upload(client, admin_token, lesson_id)
    # Student fetches the lesson, which embeds a token bound to their own uid.
    lsn = client.get(
        f"/api/lessons/{lesson_id}",
        headers={"Authorization": f"Bearer {student_token}"},
    ).get_json()["lesson"]
    student_token_for_image = lsn["images"][0]["token"]

    r = client.get(
        f"/api/secure-image/{student_token_for_image}",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert r.status_code == 200


def test_no_jwt_means_401(client, admin_token, lesson_id):
    upload = _upload(client, admin_token, lesson_id).get_json()
    r = client.get(f"/api/secure-image/{upload['image']['token']}")
    assert r.status_code == 401


def test_invalid_token_is_403(client, admin_token):
    r = client.get(
        "/api/secure-image/not-a-real-token",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 403


def test_reject_non_image_upload(client, admin_token, lesson_id):
    r = client.post(
        f"/api/lessons/{lesson_id}/images",
        data={"file": (io.BytesIO(b"this is not an image"), "evil.txt")},
        headers={"Authorization": f"Bearer {admin_token}"},
        content_type="multipart/form-data",
    )
    assert r.status_code == 400
