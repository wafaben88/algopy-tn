"""Secure-image streaming route."""

from __future__ import annotations

import jwt as pyjwt
from flask import Blueprint, abort, send_file
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models import Lesson, LessonImage
from ..services.auth import current_user
from ..services.images import absolute_path_for, decode_image_token

bp = Blueprint("images", __name__)


@bp.get("/secure-image/<token>")
@jwt_required()
def serve_protected_image(token: str):
    user = current_user()
    if user is None:
        abort(401, description="Authentication required.")

    try:
        payload = decode_image_token(token)
    except pyjwt.ExpiredSignatureError:
        abort(403, description="Image token expired.")
    except pyjwt.InvalidTokenError:
        abort(403, description="Invalid image token.")

    if int(payload.get("uid", 0)) != user.id and not user.is_admin:
        # Tokens are bound to the user that requested them; admins may
        # impersonate during preview.
        abort(403, description="Token does not match current user.")

    image_id = int(payload["img"])
    image = db.session.get(LessonImage, image_id)
    if image is None:
        abort(404, description="Image not found.")

    lesson: Lesson = image.lesson
    can_view = user.is_admin or (
        lesson.is_published and lesson.section.chapter.is_published
    )
    if not can_view:
        abort(403, description="No access to this lesson.")

    abs_path = absolute_path_for(image)
    if not abs_path.exists():
        abort(404, description="Image file missing on disk.")

    response = send_file(
        abs_path,
        mimetype=image.mime_type,
        as_attachment=False,
        download_name=image.filename,
    )
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
    response.headers["Pragma"] = "no-cache"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Content-Disposition"] = "inline"
    response.headers["Content-Security-Policy"] = "default-src 'none'; img-src 'self';"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response
