"""Auth helpers and decorators."""

from __future__ import annotations

from collections.abc import Callable
from functools import wraps
from typing import ParamSpec, TypeVar

from flask import abort
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import User, UserRole

P = ParamSpec("P")
R = TypeVar("R")


def current_user() -> User | None:
    """Resolve the current user from the JWT identity. Returns None if anonymous."""
    identity = get_jwt_identity()
    if identity is None:
        return None
    user = db.session.get(User, int(identity))
    return user


def login_required_endpoint(fn: Callable[P, R]) -> Callable[P, R]:
    """Same as `jwt_required()` but loads the user too — fails 401 if missing."""

    @wraps(fn)
    @jwt_required()
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        if current_user() is None:
            abort(401, description="Authentication required.")
        return fn(*args, **kwargs)

    return wrapper


def admin_required(fn: Callable[P, R]) -> Callable[P, R]:
    @wraps(fn)
    @jwt_required()
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        user = current_user()
        if user is None:
            abort(401, description="Authentication required.")
        if user.role != UserRole.ADMIN:
            abort(403, description="Admin role required.")
        return fn(*args, **kwargs)

    return wrapper
