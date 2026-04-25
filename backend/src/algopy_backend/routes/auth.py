"""Auth: register, login, /me."""

from __future__ import annotations

from flask import Blueprint, abort, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token

from ..extensions import db
from ..models import User, UserRole
from ..schemas import LoginPayload, RegisterPayload
from ..services.auth import current_user, login_required_endpoint
from ..services.passwords import hash_password, verify_password
from ._helpers import get_json_payload

bp = Blueprint("auth", __name__)


def _tokens(user: User) -> dict:
    return {
        "access_token": create_access_token(identity=str(user.id)),
        "refresh_token": create_refresh_token(identity=str(user.id)),
    }


@bp.post("/register")
def register():
    payload = get_json_payload(RegisterPayload)
    existing = db.session.query(User).filter_by(email=payload.email.lower()).one_or_none()
    if existing is not None:
        abort(400, description="Email already registered.")

    user = User(
        email=payload.email.lower(),
        name=payload.name,
        password_hash=hash_password(payload.password),
        role=UserRole.STUDENT,
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user=user.to_public_dict(), **_tokens(user)), 201


@bp.post("/login")
def login():
    payload = get_json_payload(LoginPayload)
    user = db.session.query(User).filter_by(email=payload.email.lower()).one_or_none()
    if user is None or not verify_password(user.password_hash, payload.password):
        abort(401, description="Invalid email or password.")
    return jsonify(user=user.to_public_dict(), **_tokens(user)), 200


@bp.get("/me")
@login_required_endpoint
def me():
    user = current_user()
    assert user is not None
    return jsonify(user=user.to_public_dict()), 200
