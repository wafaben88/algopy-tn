"""Shared fixtures."""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

import pytest

from algopy_backend.app import create_app
from algopy_backend.config import Settings
from algopy_backend.extensions import db


@pytest.fixture()
def app(tmp_path: Path):
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()
    instance = tmp_path / "instance"
    instance.mkdir()

    settings = Settings(
        flask_env="development",
        secret_key="test-secret-very-long-1234567890",
        jwt_secret_key="test-jwt-very-long-1234567890",
        database_url=f"sqlite:///{instance / 'test.db'}",
        upload_dir=upload_dir,
        secure_image_ttl=300,
        cors_origins="http://localhost:3000",
    )

    app = create_app(settings)
    app.config["TESTING"] = True
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def admin_token(client) -> str:
    """Register an admin via direct DB insert (faster than going through CLI)."""
    from algopy_backend.extensions import db
    from algopy_backend.models import User, UserRole
    from algopy_backend.services.passwords import hash_password

    user = User(
        email="admin@example.com",
        name="Admin",
        password_hash=hash_password("admin12345"),
        role=UserRole.ADMIN,
    )
    db.session.add(user)
    db.session.commit()

    resp = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "admin12345"},
    )
    assert resp.status_code == 200
    return resp.get_json()["access_token"]


@pytest.fixture()
def student_token(client) -> str:
    resp = client.post(
        "/api/auth/register",
        json={
            "email": "student@example.com",
            "name": "Student",
            "password": "student12345",
        },
    )
    assert resp.status_code == 201
    return resp.get_json()["access_token"]
